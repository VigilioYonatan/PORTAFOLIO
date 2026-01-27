import { TenantRepository } from "@modules/tenant/repositories/tenant.repository";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { UserService } from "@modules/user/services/user.service";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { TOTP } from "otplib";
import type { AuthRegisterDto } from "../dtos/register.dto";
import { AuthService } from "../services/auth.service";

vi.mock("@infrastructure/utils/server/encryption.utils", () => ({
	encrypt: vi.fn().mockImplementation((val) => `encrypted_${val}`),
	decrypt: vi.fn().mockImplementation((val) => val.replace("encrypted_", "")),
}));

// Mock bcrypt globally
vi.mock("bcrypt", () => ({
	compare: vi.fn(),
	hash: vi.fn(),
}));

// Mock otplib and qrcode
vi.mock("otplib", () => {
	const mockTOTP = vi.fn();
	return {
		TOTP: mockTOTP,
		ScureBase32Plugin: vi.fn(),
		NobleCryptoPlugin: vi.fn(),
	};
});

vi.mock("qrcode", () => ({
	toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,mock_qr"),
}));

describe("AuthService", () => {
	let service: AuthService;
	let userService: UserService;
	let jwtService: JwtService;

	const mockUserService = {
		getByEmailForAuth: vi.fn(),
		store: vi.fn(),
		showByIdForAuth: vi.fn(),
		updateForAuth: vi.fn(),
		resetAttempts: vi.fn(),
		storeForAuth: vi.fn(),
	};

	const mockJwtService = {
		sign: vi.fn(),
		verify: vi.fn(),
	};

	const mockConfigService = {
		get: vi.fn(),
	};

	const mockEventEmitter = {
		emitAsync: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserService,
					useValue: mockUserService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: EventEmitter2,
					useValue: mockEventEmitter,
				},
				{
					provide: TenantRepository,
					useValue: {
						store: vi.fn().mockResolvedValue({ id: 1, name: "Test Tenant" }),
					},
				},
			],
		}).compile();

		// Default mock for TOTP
		vi.mocked(TOTP).mockImplementation(
			(() =>
				({
					generateSecret: vi.fn().mockReturnValue("mock_secret"),
					generate: vi.fn().mockResolvedValue("123456"),
					verify: vi.fn().mockReturnValue(true),
					toURI: vi.fn().mockReturnValue("mock_uri"),
					options: {},
					checkDelta: vi.fn(),
					check: vi.fn(),
					defaultOptions: {},
				}) as unknown as TOTP) as unknown as any,
		);

		service = module.get<AuthService>(AuthService);
		userService = module.get<UserService>(UserService);
		jwtService = module.get<JwtService>(JwtService);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("validateUser", () => {
		it("should return user without password if validation is successful", async () => {
			const tenantId = 1;
			const password = "password123";
			const hashedPassword = "hashed_password";
			const user = UserFactory.createAuthUser({ password: hashedPassword });

			vi.mocked(userService.getByEmailForAuth).mockResolvedValue(user);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			const result = await service.validateUser(user.email, password, tenantId);

			expect(result).toBeDefined();
			expect(result?.id).toBe(user.id);
			expect((result as Record<string, unknown>).password).toBeUndefined();
		});

		it("should return null if user is not found", async () => {
			vi.mocked(userService.getByEmailForAuth).mockResolvedValue(null);

			const result = await service.validateUser("test@example.com", "pass", 1);
			expect(result).toBeNull();
		});

		it("should return null if password does not match", async () => {
			const user = UserFactory.createAuthUser();
			vi.mocked(userService.getByEmailForAuth).mockResolvedValue(user);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			const result = await service.validateUser(user.email, "wrong", 1);
			expect(result).toBeNull();
		});
	});

	describe("login", () => {
		it("should return access_token and refresh_token", async () => {
			const user = UserFactory.createAuthUser();
			const token = "mock_token";

			vi.mocked(jwtService.sign).mockReturnValue(token);

			const result = await service.login(user);

			expect(result).toBeDefined();
			expect(result.access_token).toBe(token);
			expect(result.refresh_token).toBe(token);
			expect(result.user).toEqual(user);
		});
	});

	describe("register", () => {
		it("should register a new user successfully", async () => {
			const tenantId = 1;
			const registerDto: AuthRegisterDto = {
				username: "newuser",
				email: "new@example.com",
				password: "Password123!",
				repeat_password: "Password123!",
				phone_number: "123456789",
				tenant_name: "test-tenant",
				terms_accepted: true,
			};
			const newUser = UserFactory.createAuthUser({
				email: registerDto.email,
			});

			vi.mocked(userService.getByEmailForAuth).mockResolvedValue(null);
			vi.mocked(userService.store).mockResolvedValue({
				success: true,
				user: newUser,
			});
			vi.mocked(jwtService.sign).mockReturnValue("mock_token");

			const result = await service.register(tenantId, registerDto);

			expect(userService.store).toHaveBeenCalledWith(
				tenantId,
				expect.objectContaining({
					email: registerDto.email,
					status: "ACTIVE",
				}),
			);
			expect(result).toBeDefined();
			expect(result.access_token).toBe("mock_token");
		});

		it("should throw BadRequestException if user already exists", async () => {
			const tenantId = 1;
			const registerDto: AuthRegisterDto = {
				username: "existing",
				email: "existing@example.com",
				password: "Password123!",
				repeat_password: "Password123!",
				phone_number: "123123123",
				tenant_name: "existing-tenant",
				terms_accepted: true,
			};

			vi.mocked(userService.getByEmailForAuth).mockResolvedValue(
				UserFactory.createAuthUser(),
			);
			vi.mocked(userService.store).mockRejectedValue(
				new BadRequestException("User already exists"),
			);

			await expect(service.register(tenantId, registerDto)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("validateGoogleUser", () => {
		it("should return existing user without password", async () => {
			const tenantId = 1;
			const profile = { emails: [{ value: "google@example.com" }] } as never;
			const user = UserFactory.createAuthUser();

			vi.mocked(userService.getByEmailForAuth).mockResolvedValue(user);

			const result = await service.validateGoogleUser(profile, tenantId);

			expect(result).toBeDefined();
			expect(result.id).toBe(user.id);
		});

		it("should register and return new user if not found", async () => {
			const tenantId = 1;
			const profile = {
				emails: [{ value: "newgoogle@example.com" }],
				id: "google123",
			} as never;
			const newUser = UserFactory.createAuthUser({
				email: "newgoogle@example.com",
			});

			vi.mocked(userService.getByEmailForAuth).mockResolvedValue(null);
			vi.mocked(userService.storeForAuth).mockResolvedValue(newUser);

			const result = await service.validateGoogleUser(profile, tenantId);

			expect(userService.storeForAuth).toHaveBeenCalled();
			expect(result).toBeDefined();
			expect(result.email).toBe(newUser.email);
		});
	});

	describe("setupMfa", () => {
		it("should generate secret and QR code and save it to user", async () => {
			const tenantId = 1;
			const userId = 1;
			const user = UserFactory.createAuthUser({
				id: userId,
				tenant_id: tenantId,
				is_mfa_enabled: false,
			});

			vi.mocked(userService.showByIdForAuth).mockResolvedValue(user);
			vi.mocked(userService.updateForAuth).mockResolvedValue(user as never);

			const result = await service.setupMfa(tenantId, userId);

			expect(userService.updateForAuth).toHaveBeenCalledWith(
				tenantId,
				userId,
				expect.objectContaining({
					mfa_secret: "encrypted_mock_secret",
					is_mfa_enabled: false,
				}),
			);
			expect(result.success).toBe(true);
			expect(result.qr_code).toBe("data:image/png;base64,mock_qr");
			expect(result.secret).toBe("mock_secret");
		});

		it("should throw BadRequestException if MFA is already enabled", async () => {
			const tenantId = 1;
			const userId = 1;
			const user = UserFactory.createAuthUser({
				id: userId,
				tenant_id: tenantId,
				is_mfa_enabled: true,
			});

			vi.mocked(userService.showByIdForAuth).mockResolvedValue(user);

			await expect(service.setupMfa(tenantId, userId)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("verifyMfaSetup", () => {
		it("should enable MFA and update security stamp if token is valid", async () => {
			const tenantId = 1;
			const userId = 1;
			const token = "123456";
			const user = UserFactory.createAuthUser({
				id: userId,
				tenant_id: tenantId,
				mfa_secret: "encrypted_mock_secret",
				is_mfa_enabled: false,
			});

			vi.mocked(userService.showByIdForAuth).mockResolvedValue(user);

			const result = await service.verifyMfaSetup(tenantId, userId, { token });

			expect(userService.updateForAuth).toHaveBeenCalledWith(
				tenantId,
				userId,
				expect.objectContaining({
					is_mfa_enabled: true,
					security_stamp: expect.any(String),
				}),
			);
			expect(result.success).toBe(true);
		});

		it("should throw BadRequestException if token is invalid", async () => {
			const tenantId = 1;
			const userId = 1;
			const token = "wrong";
			const user = UserFactory.createAuthUser({
				id: userId,
				tenant_id: tenantId,
				mfa_secret: "encrypted_mock_secret",
				is_mfa_enabled: false,
			});

			vi.mocked(userService.showByIdForAuth).mockResolvedValue(user);

			vi.mocked(TOTP).mockImplementation(
				(() =>
					({
						verify: vi.fn().mockReturnValue(false),
						generateSecret: vi.fn(),
						toURI: vi.fn(),
					}) as unknown as TOTP) as unknown as any,
			);

			await expect(
				service.verifyMfaSetup(tenantId, userId, { token }),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("disableMfa", () => {
		const mfaDisableDto = {
			password: "Password123!",
			token: "123456",
		};

		it("should disable MFA successfully", async () => {
			const user = UserFactory.createAuthUser({
				id: 1,
				tenant_id: 1,
				is_mfa_enabled: true,
				mfa_secret: "encrypted_mock_secret",
				password: "hashed_password",
			});

			vi.mocked(userService.showByIdForAuth).mockResolvedValue(user);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			const result = await service.disableMfa(1, 1, mfaDisableDto);

			expect(result.success).toBe(true);
			expect(userService.updateForAuth).toHaveBeenCalledWith(
				1,
				1,
				expect.objectContaining({
					is_mfa_enabled: false,
					mfa_secret: null,
					qr_code_token: null,
				}),
			);
		});

		it("should throw BadRequestException if password is wrong", async () => {
			const user = UserFactory.createAuthUser({
				id: 1,
				tenant_id: 1,
				password: "hashed_password",
			});
			vi.mocked(userService.showByIdForAuth).mockResolvedValue(user);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(service.disableMfa(1, 1, mfaDisableDto)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should throw BadRequestException if token is wrong", async () => {
			const user = UserFactory.createAuthUser({
				id: 1,
				tenant_id: 1,
				is_mfa_enabled: true,
				mfa_secret: "encrypted_mock_secret",
				password: "hashed_password",
			});

			vi.mocked(userService.showByIdForAuth).mockResolvedValue(user);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			vi.mocked(TOTP).mockImplementation(
				(() =>
					({
						verify: vi.fn().mockReturnValue(false),
						generateSecret: vi.fn(),
						toURI: vi.fn(),
					}) as unknown as TOTP) as unknown as any,
			);

			await expect(service.disableMfa(1, 1, mfaDisableDto)).rejects.toThrow(
				BadRequestException,
			);
		});
	});
});
