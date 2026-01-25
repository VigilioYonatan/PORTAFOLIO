import type { PaginatorResult } from "@infrastructure/utils/server/helpers";
import { paginator } from "@infrastructure/utils/server/helpers";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TenantCache } from "../caches/tenant.cache";
import type { TenantStoreDto } from "../dtos/tenant.store.dto";
import type { TenantUpdateDto } from "../dtos/tenant.update.dto";
import { TenantRepository } from "../repositories/tenant.repository";
import type { TenantSchema, TenantShowSchema } from "../schemas/tenant.schema";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";
import { TenantService } from "../services/tenant.service";

vi.mock("@infrastructure/utils/server/helpers", () => ({
	paginator: vi.fn(),
}));

// Test constants following rules
const MOCK_DATE = new Date("2025-01-01T00:00:00Z");

// Mock tenant following TenantSchema exactly
const mockTenant: TenantSchema = {
	id: 1,
	name: "Tenant 1",
	slug: "tenant-1",
	domain: null,
	logo: null,
	email: "test@test.com",
	phone: null,
	address: null,
	plan: "FREE",
	is_active: true,
	trial_ends_at: null,
	created_at: MOCK_DATE,
	updated_at: MOCK_DATE,
};

// Mock tenant settings following TenantSettingSchema exactly
const mockSettings: TenantSettingSchema = {
	id: 1,
	tenant_id: 1,
	is_verified: false,
	color_primary: "#3B82F6",
	color_secondary: "#10B981",
	default_language: "ES",
	time_zone: "UTC",
	created_at: MOCK_DATE,
	updated_at: MOCK_DATE,
};

// Mock tenant with settings for show endpoints
const mockTenantShow: TenantShowSchema = {
	...mockTenant,
	setting: mockSettings,
};

const mockTenantRepository = {
	index: vi.fn(),
	showById: vi.fn(),
	store: vi.fn(),
	update: vi.fn(),
	destroy: vi.fn(),
	showSetting: vi.fn(),
	updateSetting: vi.fn(),
};

const mockTenantCache = {
	get: vi.fn(),
	getByHost: vi.fn(),
	set: vi.fn(),
	setByHost: vi.fn(),
	invalidate: vi.fn(),
	getList: vi.fn(),
	setList: vi.fn(),
	invalidateLists: vi.fn(),
};

describe("TenantService", () => {
	let service: TenantService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new TenantService(
			mockTenantRepository as unknown as TenantRepository,
			mockTenantCache as unknown as TenantCache,
		);
	});

	describe("index", () => {
		it("should return paginated tenants", async () => {
			const query = { limit: 10, offset: 0 };
			const mockPaginatedResult: PaginatorResult<TenantSchema> = {
				success: true,
				count: 1,
				next: null,
				previous: null,
				results: [mockTenant],
			};

			vi.mocked(paginator).mockResolvedValue(mockPaginatedResult as never);

			const result = await service.index(query);

			expect(result.success).toBe(true);
			expect(result.results).toHaveLength(1);
			expect(paginator).toHaveBeenCalled();
		});
	});

	describe("show", () => {
		it("should return a tenant by ID (Cache Miss)", async () => {
			mockTenantCache.get.mockResolvedValue(null);
			mockTenantRepository.showById.mockResolvedValue(mockTenantShow);

			const result = await service.show(1);

			expect(result.success).toBe(true);
			expect(result.tenant).toEqual(mockTenantShow);
			expect(mockTenantCache.get).toHaveBeenCalledWith(1);
			expect(mockTenantRepository.showById).toHaveBeenCalledWith(1);
			expect(mockTenantCache.set).toHaveBeenCalledWith(mockTenantShow);
		});

		it("should return a tenant by ID (Cache Hit)", async () => {
			mockTenantCache.get.mockResolvedValue(mockTenantShow);

			const result = await service.show(1);

			expect(result.success).toBe(true);
			expect(result.tenant).toEqual(mockTenantShow);
			expect(mockTenantCache.get).toHaveBeenCalledWith(1);
			expect(mockTenantRepository.showById).not.toHaveBeenCalled();
		});

		it("should throw NotFoundException if tenant not found", async () => {
			mockTenantCache.get.mockResolvedValue(null);
			mockTenantRepository.showById.mockResolvedValue(null);

			await expect(service.show(999)).rejects.toThrow(NotFoundException);
		});
	});

	describe("store", () => {
		it("should create a new tenant", async () => {
			const body: TenantStoreDto = {
				name: "New Tenant",
				email: "new@test.com",
				plan: "FREE",
				is_active: true,
				domain: null,
				logo: null,
				phone: null,
				address: null,
				trial_ends_at: null,
			};
			const createdTenant: TenantSchema = {
				id: 2,
				...body,
				slug: "new-tenant",
				created_at: MOCK_DATE,
				updated_at: MOCK_DATE,
			};
			const createdTenantShow: TenantShowSchema = {
				...createdTenant,
				setting: mockSettings,
			};

			mockTenantRepository.store.mockResolvedValue(createdTenant);
			mockTenantRepository.showById.mockResolvedValue(createdTenantShow);
			mockTenantCache.set.mockResolvedValue(undefined);
			mockTenantCache.invalidateLists.mockResolvedValue(undefined);

			const result = await service.store(body);

			expect(result.success).toBe(true);
			expect(result.tenant).toEqual(createdTenantShow);
			expect(mockTenantRepository.store).toHaveBeenCalledWith(
				expect.objectContaining({
					...body,
					slug: "new-tenant",
				}),
			);
			expect(mockTenantCache.invalidateLists).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update an existing tenant", async () => {
			const body: TenantUpdateDto = {
				name: "Updated Name",
				logo: null,
				email: "updated@test.com",
				phone: null,
				address: null,
				trial_ends_at: null,
			};
			const updatedTenant: TenantSchema = {
				...mockTenant,
				name: "Updated Name",
				email: "updated@test.com",
			};

			mockTenantRepository.update.mockResolvedValue(updatedTenant);
			mockTenantRepository.showById.mockResolvedValue(updatedTenant);
			mockTenantCache.invalidate.mockResolvedValue(undefined);
			mockTenantCache.invalidateLists.mockResolvedValue(undefined);

			const result = await service.update(1, body);

			expect(result.success).toBe(true);
			expect(result.tenant).toEqual(updatedTenant);
			expect(mockTenantRepository.update).toHaveBeenCalledWith(1, body);
			expect(mockTenantCache.invalidate).toHaveBeenCalledWith(1);
			expect(mockTenantCache.invalidateLists).toHaveBeenCalled();
		});
	});

	describe("destroy", () => {
		it("should delete a tenant", async () => {
			mockTenantRepository.destroy.mockResolvedValue(mockTenant);
			mockTenantCache.invalidate.mockResolvedValue(undefined);
			mockTenantCache.invalidateLists.mockResolvedValue(undefined);

			const result = await service.destroy(1);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Tenant eliminado exitosamente");
			expect(mockTenantRepository.destroy).toHaveBeenCalledWith(1);
			expect(mockTenantCache.invalidate).toHaveBeenCalledWith(1);
			expect(mockTenantCache.invalidateLists).toHaveBeenCalled();
		});
	});

	describe("showSettings", () => {
		it("should return tenant settings", async () => {
			mockTenantRepository.showById.mockResolvedValue(mockTenantShow);
			mockTenantCache.get.mockResolvedValue(null);

			const result = await service.showSettings(1);

			expect(result.success).toBe(true);
			expect(result.setting).toEqual(mockSettings);
			expect(mockTenantRepository.showById).toHaveBeenCalledWith(1);
		});

		it("should throw NotFoundException if settings not found", async () => {
			mockTenantRepository.showById.mockResolvedValue(null);
			mockTenantCache.get.mockResolvedValue(null);

			await expect(service.showSettings(999)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("updateSetting", () => {
		it("should update tenant settings", async () => {
			const body = {
				color_primary: "#123456",
				color_secondary: "#10B981",
				default_language: "ES" as const,
				time_zone: "UTC" as const,
			};
			const updatedSettings: TenantSettingSchema = {
				...mockSettings,
				color_primary: "#123456",
			};

			mockTenantRepository.updateSetting.mockResolvedValue(updatedSettings);
			mockTenantCache.invalidate.mockResolvedValue(undefined);

			const result = await service.updateSetting(1, body);

			expect(result.success).toBe(true);
			expect(result.setting).toEqual(updatedSettings);
			expect(mockTenantRepository.updateSetting).toHaveBeenCalledWith(1, body);
			expect(mockTenantCache.invalidate).toHaveBeenCalledWith(1);
		});
	});
});
