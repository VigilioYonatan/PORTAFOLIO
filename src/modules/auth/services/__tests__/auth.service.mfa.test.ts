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

describe("AuthService - MFA Setup", () => {
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

	it("should generate secret, encrypt it, and update user", async () => {
		const tenantId = 1;
		const userId = 1;

		// Mock user exists and MFA not enabled
		mockUserService.showByIdForAuth.mockResolvedValue({
			id: userId,
			email: "test@example.com",
			is_mfa_enabled: false,
		});

		const result = await authService.setupMfa(tenantId, userId);

		expect(result.success).toBe(true);
		expect(result.secret).toBeDefined();
		expect(result.qr_code).toContain("data:image/png;base64");

		// Verify UserService was called with ENCRYPTED secret
		expect(mockUserService.updateForAuth).toHaveBeenCalledWith(
			tenantId,
			userId,
			expect.objectContaining({
				mfa_secret: `encrypted:${result.secret}`, // Check if encrypt mock was used
				is_mfa_enabled: false,
			}),
		);
	});

	it("should throw if user not found", async () => {
		mockUserService.showByIdForAuth.mockResolvedValue(null);
		await expect(authService.setupMfa(1, 999)).rejects.toThrow(
			NotFoundException,
		);
	});

	it("should throw if MFA already enabled", async () => {
		mockUserService.showByIdForAuth.mockResolvedValue({
			id: 1,
			is_mfa_enabled: true,
		});
		await expect(authService.setupMfa(1, 1)).rejects.toThrow(
			BadRequestException,
		);
	});
});
