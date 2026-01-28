import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { Public } from "../decorators/public.decorator";
import { Roles } from "../decorators/roles.decorator";
import {
	AuthEndImpersonateResponseClassDto,
	AuthForgotPasswordResponseClassDto,
	AuthImpersonateResponseClassDto,
	AuthLoginResponseClassDto,
	AuthLogoutResponseClassDto,
	AuthMfaDisableResponseClassDto,
	AuthMfaSetupResponseClassDto,
	AuthMfaVerifyResponseClassDto,
	AuthRefreshTokenResponseClassDto,
	AuthResetPasswordResponseClassDto,
	AuthSessionResponseClassDto,
	AuthVerifyEmailResponseClassDto,
} from "../dtos/auth.response.class.dto";
import {
	type AuthForgotPasswordDto,
	authForgotPasswordDto,
} from "../dtos/forgot-password.dto";
import { AuthImpersonateClassDto } from "../dtos/impersonate.class.dto";
import {
	type AuthImpersonateDto,
	authImpersonateDto,
} from "../dtos/impersonate.dto";
import { AuthLoginDtoClass } from "../dtos/login.class.dto";
import { AuthMfaDisableClassDto } from "../dtos/mfa-disable.class.dto";
import {
	type AuthMfaDisableDto,
	authMfaDisableDto,
} from "../dtos/mfa-disable.dto";
import { AuthMfaLoginClassDto } from "../dtos/mfa-login.class.dto";
import { type AuthMfaLoginDto, authMfaLoginDto } from "../dtos/mfa-login.dto";
import {
	type AuthMfaVerifyDto,
	authMfaVerifyDto,
} from "../dtos/mfa-verify.dto";
import {
	type AuthRefreshTokenDto,
	authRefreshTokenDto,
} from "../dtos/refresh-token.dto";
import { type AuthRegisterDto, authRegisterDto } from "../dtos/register.dto";
import {
	type AuthResetPasswordDto,
	authResetPasswordDto,
} from "../dtos/reset-password.dto";
import {
	type AuthVerifyEmailDto,
	authVerifyEmailDto,
} from "../dtos/verify-email.dto";
import { GoogleAuthGuard } from "../guards/google-auth.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { LocalAuthGuard } from "../guards/local-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { AuthService } from "../services/auth.service";

@ApiTags("Auth")
@Controller("/auth")
export class AuthController {
	constructor(@Inject(AuthService) private readonly authService: AuthService) {}
	@Public()
	@UseGuards(LocalAuthGuard)
	@Post("/login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login with email and password" })
	@ApiBody({ type: AuthLoginDtoClass })
	@ApiResponse({ status: 200, type: AuthLoginResponseClassDto })
	async login(@Req() req: Request): Promise<AuthLoginResponseClassDto> {
		// LocalStrategy validated user and populated req.user and LocalAuthGuard synced it to req.locals.user
		const user = req.locals.user!;
		return this.authService.login(user);
	}

	@Public()
	@Post("/register")
	@ApiOperation({ summary: "Register new user" })
	@ApiResponse({ status: 201, type: AuthLoginResponseClassDto })
	async register(
		@Req() req: Request,
		@Body(new ZodPipe(authRegisterDto)) body: AuthRegisterDto,
	): Promise<AuthLoginResponseClassDto> {
		// New registration creates a tenant, so we don't expect an existing tenant in context usually.
		// However, if we support "invitations" later, that would be a different endpoint or logic.
		// For now, consistent with creating a NEW tenant.
		const tenant_id = req.locals.tenant?.id;
		return this.authService.register(tenant_id, body);
	}

	@Public()
	@Post("/login/mfa")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Verify MFA code" })
	@ApiBody({ type: AuthMfaLoginClassDto })
	async loginMfa(
		@Body(new ZodPipe(authMfaLoginDto)) body: AuthMfaLoginDto,
	): Promise<AuthLoginResponseClassDto> {
		return this.authService.verifyMfa(body);
	}

	// 3.4 POST /auth/refresh - Silent token rotation
	@Public()
	@Post("/refresh")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({ status: 200, type: AuthRefreshTokenResponseClassDto })
	async refreshToken(
		@Body(new ZodPipe(authRefreshTokenDto)) body: AuthRefreshTokenDto,
	): Promise<AuthRefreshTokenResponseClassDto> {
		return this.authService.refreshToken(body);
	}

	@Get("/session")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get current session user" })
	@ApiResponse({ status: 200, type: AuthSessionResponseClassDto })
	async session(@Req() req: Request): Promise<AuthSessionResponseClassDto> {
		const user = req.locals.user!;
		return {
			success: true,
			user: user,
		};
	}

	@UseGuards(JwtAuthGuard)
	@Post("/mfa/setup")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Generar secreto MFA y código QR" })
	@ApiBody({ schema: { properties: {} } }) // Mostrar explícitamente cuerpo vacío en Swagger
	@ApiResponse({
		status: HttpStatus.OK,
		type: AuthMfaSetupResponseClassDto,
		description: "Datos de configuración MFA generados",
	})
	async setupMfa(@Req() req: Request): Promise<AuthMfaSetupResponseClassDto> {
		return this.authService.setupMfa(
			req.locals.tenant?.id,
			req.locals.user!.id,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Post("/mfa/verify")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({ status: 200, type: AuthMfaVerifyResponseClassDto })
	verifyMfaSetup(
		@Req() req: Request,
		@Body(new ZodPipe(authMfaVerifyDto)) body: AuthMfaVerifyDto,
	): Promise<AuthMfaVerifyResponseClassDto> {
		return this.authService.verifyMfaSetup(
			req.locals.tenant.id,
			req.locals.user!.id,
			body,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Post("/mfa/disable")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Deshabilitar MFA" })
	@ApiBody({ type: AuthMfaDisableClassDto })
	@ApiResponse({ status: 200, type: AuthMfaDisableResponseClassDto })
	async disableMfa(
		@Req() req: Request,
		@Body(new ZodPipe(authMfaDisableDto)) body: AuthMfaDisableDto,
	): Promise<AuthMfaDisableResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		const user_id = req.locals.user!.id;
		return this.authService.disableMfa(tenant_id, user_id, body);
	}

	@Public()
	@Post("/verify-email")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({ status: 200, type: AuthVerifyEmailResponseClassDto })
	async verifyEmail(
		@Body(new ZodPipe(authVerifyEmailDto)) body: AuthVerifyEmailDto,
	): Promise<AuthVerifyEmailResponseClassDto> {
		return this.authService.verifyEmail(body);
	}

	@Public()
	@Post("/forgot-password")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Request password reset email" })
	@ApiResponse({ status: 200, type: AuthForgotPasswordResponseClassDto })
	async forgotPassword(
		@Body(new ZodPipe(authForgotPasswordDto)) body: AuthForgotPasswordDto,
		@Req() req: Request,
	): Promise<AuthForgotPasswordResponseClassDto> {
		return this.authService.forgotPassword(body.email, req.locals.tenant.id);
	}

	@Public()
	@Post("/reset-password")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Reset password" })
	@ApiResponse({ status: 200, type: AuthResetPasswordResponseClassDto })
	async resetPassword(
		@Body(new ZodPipe(authResetPasswordDto)) body: AuthResetPasswordDto,
	): Promise<AuthResetPasswordResponseClassDto> {
		return this.authService.resetPassword(body);
	}

	// Note: GET /users/me moved to UserController (4.1)
	// Note: GET /users/me/qr moved to UserController (3.6)

	@Public()
	@Get("/google")
	@UseGuards(GoogleAuthGuard)
	@ApiOperation({ summary: "Initiate Google OAuth flow" })
	async googleAuth(): Promise<void> {
		// Initiates Google OAuth flow
	}

	@Public()
	@Get("/google/callback")
	@UseGuards(GoogleAuthGuard)
	@ApiOperation({ summary: "Google OAuth callback" })
	async googleAuthRedirect(
		@Req() req: Request,
		@Res() res: Response,
	): Promise<void> {
		const user = req.locals.user!;
		const loginResult = await this.authService.login(user);

		const clientUrl =
			process.env.PUBLIC_URL || `http://${req.headers.host || "localhost"}`;

		if (loginResult.mfa_required) {
			return res.redirect(
				`${clientUrl}/auth/mfa/verify?temp_token=${loginResult.temp_token}`,
			);
		}

		const redirectUrl = new URL(`${clientUrl}/auth/callback`);
		if (loginResult.access_token && loginResult.refresh_token) {
			redirectUrl.searchParams.set("access_token", loginResult.access_token);
			redirectUrl.searchParams.set("refresh_token", loginResult.refresh_token);
		}

		return res.redirect(redirectUrl.toString());
	}

	@Post("/logout")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Logout current session" })
	@ApiResponse({ status: 200, type: AuthLogoutResponseClassDto })
	async logout(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthLogoutResponseClassDto> {
		const user = req.locals.user;
		const tenant = req.locals.tenant;

		if (!user || !tenant) {
			throw new UnauthorizedException("Session or user context missing");
		}

		if (req.session) {
			req.session.destroy(() => {
				// session destroyed
			});
		}

		// Clear cookies if any
		res.clearCookie("connect.sid");

		return this.authService.logout(user.id, tenant.id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(1, 2) // role_id: 1 = super-admin, 2 = administracion
	@HttpCode(HttpStatus.OK)
	@Post("/impersonate/:id")
	@ApiOperation({ summary: "Impersonate another user" })
	@ApiBody({ type: AuthImpersonateClassDto })
	@ApiResponse({ status: 200, type: AuthImpersonateResponseClassDto })
	async impersonate(
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(authImpersonateDto)) body: AuthImpersonateDto,
		@Req() req: Request,
	): Promise<AuthImpersonateResponseClassDto> {
		return this.authService.impersonate(
			req.locals.user.id,
			id,
			req.locals.tenant.id,
			body.reason,
		);
	}

	// 4.7 DELETE /auth/impersonate - End impersonation session
	@UseGuards(JwtAuthGuard)
	@Delete("/impersonate")
	@ApiOperation({ summary: "End impersonation session" })
	@ApiResponse({ status: 200, type: AuthEndImpersonateResponseClassDto })
	async endImpersonate(
		@Req() req: Request,
	): Promise<AuthEndImpersonateResponseClassDto> {
		return this.authService.endImpersonate(req.locals.user.id);
	}
}
