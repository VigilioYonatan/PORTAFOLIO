import { TenantRepository } from "@modules/tenant/repositories/tenant.repository";
import { UserService } from "@modules/user/services/user.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
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
			verify = vi.fn().mockImplementation((token, options) => {
				return token === "123456" && !!options.secret;
			});
			generateSecret = vi.fn();
			toURI = vi.fn();
		},
		ScureBase32Plugin: class {},
		NobleCryptoPlugin: class {},
	};
});

describe("AuthService - MFA Disable", () => {
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

	it("should disable MFA successfully with valid password and token", async () => {
		const tenantId = 1;
		const userId = 1;
		const hashedPassword = await bcrypt.hash("password123", 10);

		mockUserService.showByIdForAuth.mockResolvedValue({
			id: userId,
			password: hashedPassword,
			is_mfa_enabled: true,
			mfa_secret: "encrypted:secret123",
		});

		const body = { password: "password123", token: "123456" };

		const result = await authService.disableMfa(tenantId, userId, body);

		expect(result.success).toBe(true);
		// Verify update call
		expect(mockUserService.updateForAuth).toHaveBeenCalledWith(
			tenantId,
			userId,
			expect.objectContaining({
				is_mfa_enabled: false,
				mfa_secret: null,
				qr_code_token: null,
				security_stamp: expect.any(String),
			}),
		);
	});

	it("should fail with invalid password", async () => {
		const hashedPassword = await bcrypt.hash("password123", 10);

		mockUserService.showByIdForAuth.mockResolvedValue({
			id: 1,
			password: hashedPassword,
		});

		const body = { password: "wrong_password", token: "123456" };

		await expect(authService.disableMfa(1, 1, body)).rejects.toThrow(
			BadRequestException,
		);
	});

	it("should fail with invalid MFA token", async () => {
		const hashedPassword = await bcrypt.hash("password123", 10);

		mockUserService.showByIdForAuth.mockResolvedValue({
			id: 1,
			password: hashedPassword,
			is_mfa_enabled: true,
			mfa_secret: "encrypted:secret123",
		});

		const body = { password: "password123", token: "000000" }; // Invalid token

		await expect(authService.disableMfa(1, 1, body)).rejects.toThrow(
			BadRequestException,
		);
	});
});
