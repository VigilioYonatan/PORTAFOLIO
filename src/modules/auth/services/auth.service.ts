import { randomUUID } from "node:crypto";
import type { Environments } from "@infrastructure/config/server";
import { slugify } from "@infrastructure/utils/hybrid";
import {
	decrypt,
	encrypt,
} from "@infrastructure/utils/server/encryption.utils";
import { TenantRepository } from "@modules/tenant/repositories/tenant.repository";
import type { UserAuth } from "@modules/user/schemas/user.schema";
import { UserService } from "@modules/user/services/user.service";
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { Profile } from "passport-google-oauth20";
import { toDataURL } from "qrcode";
import type {
	AuthEndImpersonateResponseDto,
	AuthForgotPasswordResponseDto,
	AuthImpersonateResponseDto,
	AuthLoginResponseApi,
	AuthLogoutResponseDto,
	AuthMfaDisableResponseDto,
	AuthMfaSetupResponseDto,
	AuthMfaVerifyResponseDto,
	AuthRefreshTokenResponseApi,
	AuthResetPasswordResponseDto,
	AuthVerifyEmailResponseDto,
} from "../dtos/auth.response.dto";
import type { AuthMfaDisableDto } from "../dtos/mfa-disable.dto";
import type { AuthMfaLoginDto } from "../dtos/mfa-login.dto";
import type { AuthMfaVerifyDto } from "../dtos/mfa-verify.dto";
import type { AuthRefreshTokenDto } from "../dtos/refresh-token.dto";
import type { AuthRegisterDto } from "../dtos/register.dto";
import type { AuthResetPasswordDto } from "../dtos/reset-password.dto";
import type { AuthVerifyEmailDto } from "../dtos/verify-email.dto";
import { UserForgotPasswordEvent } from "../events/user.forgot-password.event";

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		@Inject(JwtService) private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly tenantRepository: TenantRepository,
		private readonly configService: ConfigService<Environments>,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async validateUser(
		email: string,
		pass: string,
		tenant_id: number,
	): Promise<UserAuth | null> {
		this.logger.log({ email, tenant_id }, "Validating user credentials");
		// 1. Try Cache (delegated to UserService)
		const user = await this.userService.getByEmailForAuth(tenant_id, email);

		if (user?.password) {
			const isMatch = await bcrypt.compare(pass, user.password);
			if (isMatch) {
				const { password, ...rest } = user;
				return rest;
			}
		}
		return null;
	}

	async login(user: UserAuth): Promise<AuthLoginResponseApi> {
		this.logger.log({ user_id: user.id }, "Processing login request");
		// Check if user has MFA enabled
		const mfaRequired = user.is_mfa_enabled === true;

		if (mfaRequired) {
			// Generate temporary token for MFA step
			const tempPayload = {
				sub: user.id,
				email: user.email,
				role_id: user.role_id,
				tenant_id: user.tenant_id,
				mfa_temp: true,
			};
			const tempToken = this.jwtService.sign(tempPayload, { expiresIn: "5m" });

			return {
				success: true,
				mfa_required: true,
				temp_token: tempToken,
				landing_page_route: null,
			};
		}

		// Reset failed login attempts on successful login (delegated to UserService)
		if (user.failed_login_attempts && user.failed_login_attempts > 0) {
			await this.userService.resetAttempts(user.tenant_id, user.id);
		}

		// Generate access and refresh tokens
		const payload = {
			sub: user.id,
			email: user.email,
			role_id: user.role_id,
			tenant_id: user.tenant_id,
			security_stamp: user.security_stamp,
		};
		const accessToken = this.jwtService.sign(payload);
		const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

		// Determine landing page based on user role
		const landing_page_route = "/dashboard";

		this.logger.log(
			{ user_id: user.id, email: user.email },
			"User logged in successfully",
		);

		return {
			success: true,
			access_token: accessToken,
			refresh_token: refreshToken,
			user,
			mfa_required: false,
			landing_page_route,
		};
	}

	async refreshToken(
		refreshTokenDto: AuthRefreshTokenDto,
	): Promise<AuthRefreshTokenResponseApi> {
		this.logger.log("Processing refresh token request");
		try {
			const payload = this.jwtService.verify(refreshTokenDto.refresh_token);
			const user = await this.userService.getByEmailForAuth(
				payload.tenant_id,
				payload.email,
			);
			if (!user) throw new UnauthorizedException("User not found");

			// We could add checks if user is banned/inactive here
			if (user.status !== "ACTIVE") {
				throw new UnauthorizedException("User is not active");
			}

			if (user.security_stamp !== payload.security_stamp) {
				throw new UnauthorizedException("Token has been revoked");
			}

			const newPayload = {
				sub: user.id,
				email: user.email,
				role_id: user.role_id,
				tenant_id: user.tenant_id,
				security_stamp: user.security_stamp,
			};

			return {
				success: true,
				access_token: this.jwtService.sign(newPayload),
				refresh_token: this.jwtService.sign(newPayload, { expiresIn: "7d" }),
			};
		} catch (e) {
			this.logger.error("Invalid refresh token", e);
			throw new UnauthorizedException("Invalid refresh token");
		}
	}

	async validateUserByEmail(
		tenant_id: number,
		email: string,
	): Promise<UserAuth | null> {
		const user = await this.userService.getByEmailForAuth(tenant_id, email);
		if (user) {
			const { password, ...rest } = user;
			return rest;
		}
		return null;
	}

	async validateGoogleUser(
		profile: Profile,
		tenant_id: number,
	): Promise<UserAuth> {
		if (!profile.emails || !profile.emails[0]) {
			throw new BadRequestException("Google account must have an email");
		}

		const email = profile.emails[0].value;
		const google_id = profile.id;

		// 1. Try to find user by email and tenant_id
		const user = await this.userService.getByEmailForAuth(tenant_id, email);

		if (user) {
			// 2. If user exists but doesn't have google_id linked, link it
			if (!user.google_id) {
				this.logger.log(
					{ user_id: user.id, tenant_id },
					`Linking Google account for user: ${email}`,
				);
				await this.userService.updateForAuth(tenant_id, user.id, {
					google_id,
				});
			}

			const { password, ...rest } = user;
			return rest;
		}

		this.logger.log({ email, tenant_id }, "Registering new Google user");

		// 3. Auto-register google user if not found (delegated to UserService)
		const newUser = await this.userService.storeForAuth(tenant_id, {
			email,
			username: email.split("@")[0],
			password: "", // Social auth doesn't set a local password
			role_id: 2, // Default to USER
			status: "ACTIVE",
			google_id,
			avatar: profile.photos?.[0]
				? [
						{
							key: profile.photos[0].value,
							name: "google_avatar",
							original_name: "google_avatar",
							mimetype: "image/jpeg",
							size: 0,
						},
					]
				: null,
			phone_number: null,
			mfa_secret: null,
			qr_code_token: null,
			security_stamp: randomUUID(),
			failed_login_attempts: 0,
			is_mfa_enabled: false,
			is_superuser: false,
			email_verified_at: null,
			lockout_end_at: null,
			last_login_at: null,
			deleted_at: null,
			last_ip_address: null,
		});

		return newUser;
	}

	async register(
		_tenant_id: number,
		registerDto: AuthRegisterDto,
	): Promise<AuthLoginResponseApi> {
		this.logger.log(`Registering new tenant and user: ${registerDto.email}`);

		// 1. Create Tenant
		const tenant = await this.tenantRepository.store({
			name: registerDto.tenant_name,
			slug: slugify(registerDto.tenant_name),
			email: registerDto.email,
			plan: "ENTERPRISE", // Default plan for register
			is_active: true,
			address: null,
			logo: null,
			phone: null,
			domain: null,
			trial_ends_at: null,
		});

		// 2. Create User linked to new Tenant
		const { user } = await this.userService.store(tenant.id, {
			email: registerDto.email,
			username: registerDto.username,
			password: registerDto.password,
			repeat_password: registerDto.repeat_password,
			role_id: 3, // Assuming 3 is OWNER
			status: "ACTIVE",
			phone_number: registerDto.phone_number ?? null,
		});

		// Login the new user
		return this.login(user);
	}

	async forgotPassword(
		email: string,
		tenant_id: number,
	): Promise<AuthForgotPasswordResponseDto> {
		this.logger.log({ email, tenant_id }, "Processing forgot password request");
		const user = await this.userService.getByEmailForAuth(tenant_id, email);
		if (!user) {
			throw new BadRequestException(
				"El usuario con este correo electrónico no existe",
			);
		}

		// Generate recovery token with security_stamp for invalidation
		const payload = {
			sub: user.id,
			tenant_id: user.tenant_id,
			security_stamp: user.security_stamp,
			type: "recovery",
		};

		const token = this.jwtService.sign(payload, { expiresIn: "1h" });

		this.logger.log(
			{ email, tenant_id, user_id: user.id },
			"Generating password recovery token",
		);

		const clientUrl = this.configService.get("PUBLIC_URL");
		const recoveryUrl = `${clientUrl}/auth/reset-password?token=${token}`;

		// Fire and forget event
		this.eventEmitter.emitAsync(
			UserForgotPasswordEvent.name,
			new UserForgotPasswordEvent(email, recoveryUrl, tenant_id),
		);

		return {
			success: true,
			message: `Se ha enviado un correo de recuperación a ${email}`,
		};
	}

	async resetPassword(
		body: AuthResetPasswordDto,
	): Promise<AuthResetPasswordResponseDto> {
		this.logger.log("Processing password reset request");
		const { token, new_password } = body;
		let payload: {
			sub: number;
			tenant_id: number;
			security_stamp: string;
			type: string;
		};

		try {
			payload = this.jwtService.verify(token);
		} catch (e) {
			this.logger.error("Invalid or expired recovery token", e);
			throw new UnauthorizedException(
				"Token de recuperación inválido o expirado",
			);
		}

		if (payload.type !== "recovery") {
			throw new UnauthorizedException("Tipo de token inválido");
		}

		const user = await this.userService.showByIdForAuth(
			payload.tenant_id,
			payload.sub,
		);
		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		// Verify security_stamp matches to ensure token hasn't been invalidated
		if (user.security_stamp !== payload.security_stamp) {
			throw new UnauthorizedException(
				"El token de recuperación ya no es válido o ya fue utilizado",
			);
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(new_password, 10);

		// Generate new security_stamp to invalidate CURRENT and any other active recovery tokens
		const newSecurityStamp = randomUUID();

		// Update password and security stamp (delegated to UserService)
		await this.userService.updateForAuth(payload.tenant_id, payload.sub, {
			password: hashedPassword,
			security_stamp: newSecurityStamp,
		});

		this.logger.log(
			{ user_id: user.id, tenant_id: payload.tenant_id },
			"Password reset successful",
		);

		return {
			success: true,
			message: "Contraseña actualizada exitosamente",
		};
	}

	async verifyEmail(
		body: AuthVerifyEmailDto,
	): Promise<AuthVerifyEmailResponseDto> {
		this.logger.log("Processing email verification request");
		const { token } = body;

		let payload: {
			sub: number;
			tenant_id: number;
			security_stamp: string;
			type: string;
		};
		try {
			payload = await this.jwtService.verifyAsync(token);
		} catch (error) {
			this.logger.error({ error }, "Error verificando token de verificación");
			throw new UnauthorizedException("El token no es válido o ha expirado");
		}

		if (payload.type !== "verification") {
			throw new UnauthorizedException("Tipo de token inválido");
		}

		const { sub: user_id, tenant_id, security_stamp } = payload;

		const user = await this.userService.showByIdForAuth(tenant_id, user_id);

		if (!user || user.security_stamp !== security_stamp) {
			this.logger.warn(
				{ user_id, tenant_id },
				"Token de verificación no coincide con security_stamp o usuario inexistente",
			);
			throw new UnauthorizedException("El token ya no es válido");
		}

		const newSecurityStamp = randomUUID();

		// Update and invalidate cache (delegated to UserService)
		await this.userService.updateForAuth(tenant_id, user_id, {
			email_verified_at: new Date(),
			status: "ACTIVE",
			security_stamp: newSecurityStamp,
		});

		this.logger.log({ user_id, tenant_id }, "Correo verificado exitosamente");

		return {
			success: true,
			message: "Correo electrónico verificado exitosamente",
		};
	}

	async setupMfa(
		tenant_id: number,
		user_id: number,
	): Promise<AuthMfaSetupResponseDto> {
		const { NobleCryptoPlugin, ScureBase32Plugin, TOTP } = await import(
			"otplib"
		);

		this.logger.log({ user_id, tenant_id }, "Setting up MFA");

		const user = await this.userService.showByIdForAuth(tenant_id, user_id);
		if (!user) {
			throw new NotFoundException(`User #${user_id} not found`);
		}

		if (user.is_mfa_enabled) {
			throw new BadRequestException("MFA is already enabled");
		}

		const totp = new TOTP({
			base32: new ScureBase32Plugin(),
			crypto: new NobleCryptoPlugin(),
		});

		const secret = totp.generateSecret();
		const issuer = encodeURIComponent("SaaS Platform");
		const otpauthUrl = totp.toURI({
			issuer,
			label: user.email,
			secret,
		});

		const qr_code = await toDataURL(otpauthUrl);

		// Encrypt secret before saving
		const encryptedSecret = await encrypt(secret);
		const qr_code_token = randomUUID();

		// Save secret and invalidate cache (delegated to UserService)
		await this.userService.updateForAuth(tenant_id, user_id, {
			mfa_secret: encryptedSecret,
			qr_code_token,
			is_mfa_enabled: false,
		});

		return {
			success: true,
			qr_code: qr_code,
			secret,
		};
	}

	async verifyMfaSetup(
		tenant_id: number,
		user_id: number,
		body: AuthMfaVerifyDto,
	): Promise<AuthMfaVerifyResponseDto> {
		const { NobleCryptoPlugin, ScureBase32Plugin, TOTP } = await import(
			"otplib"
		);

		this.logger.log({ tenant_id, user_id }, "Verifying MFA setup");
		const user = await this.userService.showByIdForAuth(tenant_id, user_id);

		if (!user?.mfa_secret) {
			throw new BadRequestException(
				"MFA no ha sido iniciado para este usuario",
			);
		}

		if (user.is_mfa_enabled) {
			throw new BadRequestException("MFA ya está habilitado");
		}

		const totp = new TOTP({
			base32: new ScureBase32Plugin(),
			crypto: new NobleCryptoPlugin(),
		});

		// Decrypt secret
		const decryptedSecret = await decrypt(user.mfa_secret);

		// Verify token
		const isValid = totp.verify(body.token, { secret: decryptedSecret });

		if (!isValid) {
			this.logger.warn({ user_id }, "Invalid MFA token provided for setup");
			throw new BadRequestException("Token MFA inválido");
		}

		// Activate MFA and rotate security stamp to invalidate all sessions
		await this.userService.updateForAuth(tenant_id, user_id, {
			is_mfa_enabled: true,
			security_stamp: randomUUID(),
		});

		this.logger.log({ user_id }, "MFA activated successfully");
		return { success: true, message: "MFA activated successfully" };
	}

	async disableMfa(
		tenant_id: number,
		user_id: number,
		body: AuthMfaDisableDto,
	): Promise<AuthMfaDisableResponseDto> {
		const { NobleCryptoPlugin, ScureBase32Plugin, TOTP } = await import(
			"otplib"
		);
		this.logger.log({ tenant_id, user_id }, "Deactivating MFA");
		const user = await this.userService.showByIdForAuth(tenant_id, user_id);

		if (!user) {
			throw new NotFoundException(`Usuario #${user_id} not found`);
		}

		// 1. Verify password
		if (!user.password) {
			throw new BadRequestException(
				"No se puede deshabilitar MFA para cuentas sin contraseña",
			);
		}
		const isPasswordValid = await bcrypt.compare(body.password, user.password);
		if (!isPasswordValid) {
			this.logger.warn({ user_id }, "Invalid password for MFA disable");
			throw new BadRequestException("Credenciales inválidas");
		}

		// 2. Verify token if MFA is currently enabled
		if (user.is_mfa_enabled) {
			if (!user.mfa_secret) {
				throw new BadRequestException(
					"El secreto MFA no existe para este usuario",
				);
			}

			const totp = new TOTP({
				base32: new ScureBase32Plugin(),
				crypto: new NobleCryptoPlugin(),
			});

			// Decrypt secret
			const decryptedSecret = await decrypt(user.mfa_secret);

			const isValid = totp.verify(body.token, { secret: decryptedSecret });

			if (!isValid) {
				this.logger.warn({ user_id }, "Invalid MFA token for deactivation");
				throw new BadRequestException("Token MFA inválido");
			}
		}

		// 3. Deactivate and rotate security stamp
		await this.userService.updateForAuth(tenant_id, user_id, {
			is_mfa_enabled: false,
			mfa_secret: null,
			qr_code_token: null,
			security_stamp: randomUUID(),
		});

		this.logger.log({ user_id }, "MFA deactivated successfully");
		return {
			success: true,
			message: "MFA desactivado correctamente",
		};
	}

	async verifyMfa(dto: AuthMfaLoginDto): Promise<AuthLoginResponseApi> {
		this.logger.log("Processing MFA login verification");
		const { NobleCryptoPlugin, ScureBase32Plugin, TOTP } = await import(
			"otplib"
		);

		// Verify temp token to get user info
		let payload: {
			sub: number;
			email: string;
			role: string;
			tenant_id: number;
		};
		try {
			payload = this.jwtService.verify(dto.temp_token);
		} catch {
			throw new UnauthorizedException("Invalid or expired temp token");
		}

		// Get user
		const user = await this.userService.getByEmailForAuth(
			payload.tenant_id,
			payload.email,
		);
		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		if (!user.mfa_secret) {
			throw new UnauthorizedException("MFA is not enabled for this user");
		}

		const totp = new TOTP({
			base32: new ScureBase32Plugin(),
			crypto: new NobleCryptoPlugin(),
		});

		// Decrypt secret
		const decryptedSecret = await decrypt(user.mfa_secret);

		const isValid = totp.verify(dto.mfa_code, { secret: decryptedSecret });

		if (!isValid) {
			throw new UnauthorizedException("Código MFA inválido o expirado");
		}

		this.logger.log({ user_id: user.id }, "MFA verification successful");
		const { password, ...rest } = user;
		// Return full login response with tokens
		return this.login(rest);
	}

	/**
	 * 4.6 Impersonate - Start session as another user
	 * @param actor_id - ID of the admin performing impersonation
	 * @param target_id - ID of the user to impersonate
	 * @param reason - Audit reason for impersonation
	 */
	async impersonate(
		actor_id: number,
		target_id: number,
		tenant_id: number,
		reason: string,
	): Promise<AuthImpersonateResponseDto> {
		this.logger.log(
			{ actor_id, target_id, tenant_id, reason },
			"Starting impersonation session",
		);

		const targetUser = await this.userService.showByIdForAuth(
			tenant_id,
			target_id,
		);
		if (!targetUser) {
			throw new NotFoundException(`User with ID ${target_id} not found`);
		}

		// Generate impersonation token
		const payload = {
			sub: targetUser.id,
			email: targetUser.email,
			role_id: targetUser.role_id,
			impersonated_by: actor_id,
			impersonation_reason: reason,
		};

		const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
		const refreshToken = this.jwtService.sign(payload, { expiresIn: "2h" });

		return {
			success: true,
			access_token: accessToken,
			refresh_token: refreshToken,
			impersonating: {
				user_id: targetUser.id,
				email: targetUser.email,
				role_id: targetUser.role_id,
			},
			actor_id: actor_id,
		};
	}

	/**
	 * 4.7 End Impersonate - Return to original session
	 * @param user_id - Current user ID (from token, may be impersonated user)
	 */
	async endImpersonate(
		user_id: number,
	): Promise<AuthEndImpersonateResponseDto> {
		this.logger.log({ user_id }, "Ending impersonation session");
		// Client should discard impersonation token and use original token
		// In production, we'd invalidate the impersonation token here
		return {
			success: true,
			message: "Impersonation session ended. Please use your original token.",
			ended_at: new Date().toISOString(),
		};
	}

	async logout(
		user_id?: number,
		tenant_id?: number,
	): Promise<AuthLogoutResponseDto> {
		if (user_id && tenant_id) {
			this.logger.log(
				{ user_id, tenant_id },
				"User logging out - invalidating tokens",
			);
			// Rotate security stamp and invalidate cache (delegated to UserService)
			const newSecurityStamp = randomUUID();
			await this.userService.updateForAuth(tenant_id, user_id, {
				security_stamp: newSecurityStamp,
			});
		}
		return { success: true, message: "Logged out successfully" };
	}
}
