import { TenantRepository } from "@modules/tenant/repositories/tenant.repository";
import { UserService } from "@modules/user/services/user.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../auth.service";

// Mock encryption utils
vi.mock("@infrastructure/utils/server/encryption.utils", () => ({
	encrypt: vi.fn((val) => Promise.resolve(`encrypted:${val}`)),
	decrypt: vi.fn((val) => Promise.resolve(val.replace("encrypted:", ""))),
}));

// Mock TOTP Class
vi.mock("otplib", () => {
	return {
		TOTP: class {
			// Mock verify with (token, options) signature
			verify = vi.fn().mockImplementation((token, options) => {
				// Correct check:
				// token matches "123456" AND secret is present
				return token === "123456" && !!options.secret;
			});
			generateSecret = vi.fn();
			toURI = vi.fn();
		},
		ScureBase32Plugin: class {},
		NobleCryptoPlugin: class {},
	};
});

describe("AuthService - MFA Verify Setup", () => {
	let authService: AuthService;

	const mockUserService = {
		showByIdForAuth: vi.fn(),
		updateForAuth: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UserService, useValue: mockUserService },
				{ provide: JwtService, useValue: { sign: vi.fn(), verify: vi.fn() } },
				{ provide: ConfigService, useValue: { get: vi.fn() } },
				{ provide: EventEmitter2, useValue: { emitAsync: vi.fn() } },
				{ provide: TenantRepository, useValue: {} },
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
		vi.clearAllMocks();
	});

	it("should verify token, activate MFA, and rotate security stamp", async () => {
		const tenantId = 1;
		const userId = 1;

		// Setup user with encrypted secret
		mockUserService.showByIdForAuth.mockResolvedValue({
			id: userId,
			email: "test@example.com",
			is_mfa_enabled: false,
			mfa_secret: "encrypted:secret123", // Encrypted secret exists
		});

		const result = await authService.verifyMfaSetup(tenantId, userId, {
			token: "123456",
		});

		expect(result.success).toBe(true);

		// Verify Update called with is_mfa_enabled=true and new security_stamp
		expect(mockUserService.updateForAuth).toHaveBeenCalledWith(
			tenantId,
			userId,
			expect.objectContaining({
				is_mfa_enabled: true,
				security_stamp: expect.any(String),
			}),
		);
	});

	it("should fail if invalid token", async () => {
		mockUserService.showByIdForAuth.mockResolvedValue({
			id: 1,
			mfa_secret: "encrypted:secret123",
			is_mfa_enabled: false,
		});

		// "000000" should fail (return false)
		await expect(
			authService.verifyMfaSetup(1, 1, { token: "000000" }),
		).rejects.toThrow(BadRequestException);
	});

	it("should fail if MFA already enabled", async () => {
		mockUserService.showByIdForAuth.mockResolvedValue({
			id: 1,
			mfa_secret: "encrypted:secret123",
			is_mfa_enabled: true,
		});

		await expect(
			authService.verifyMfaSetup(1, 1, { token: "123456" }),
		).rejects.toThrow(BadRequestException);
	});

	it("should fail if MFA not initiated (no secret)", async () => {
		mockUserService.showByIdForAuth.mockResolvedValue({
			id: 1,
			mfa_secret: null,
			is_mfa_enabled: false,
		});

		await expect(
			authService.verifyMfaSetup(1, 1, { token: "123456" }),
		).rejects.toThrow(BadRequestException);
	});
});
