import type { TenantStoreDto } from "@modules/tenant/dtos/tenant.store.dto";
import type { TenantSchema } from "@modules/tenant/schemas/tenant.schema";

/**
 * Test data factory for Tenant module.
 * Generates unique, valid test data for E2E and unit tests.
 *
 * Usage:
 * ```ts
 * const dto = TenantFactory.createDto();
 * const dto = TenantFactory.createDto({ name: "Custom Name" });
 * ```
 */
export class TenantFactory {
	private static counter = 0;

	/**
	 * Generate a unique ID for test isolation
	 */
	private static getUniqueId(): string {
		TenantFactory.counter++;
		return `${Date.now()}-${TenantFactory.counter}-${Math.random().toString(36).substring(7)}`;
	}

	/**
	 * Create a valid TenantStoreDto with unique values
	 */
	static createDto(overrides: Partial<TenantStoreDto> = {}): TenantStoreDto {
		const uniqueId = TenantFactory.getUniqueId();
		return {
			name: `Test Tenant ${uniqueId}`,
			email: `test-${uniqueId}@example.com`,
			plan: "FREE",
			is_active: true,
			domain: null,
			logo: null,
			phone: null,
			address: `123 Test Street ${uniqueId}`,
			trial_ends_at: null,
			...overrides,
		};
	}

	/**
	 * Create multiple DTOs at once
	 */
	static createManyDtos(
		count: number,
		overrides: Partial<TenantStoreDto> = {},
	): TenantStoreDto[] {
		return Array.from({ length: count }, () =>
			TenantFactory.createDto(overrides),
		);
	}

	/**
	 * Create a mock TenantSchema (for unit tests)
	 */
	static createSchema(overrides: Partial<TenantSchema> = {}): TenantSchema {
		const uniqueId = TenantFactory.getUniqueId();
		return {
			id: Math.floor(Math.random() * 10000) + 1000,
			name: `Test Tenant ${uniqueId}`,
			slug: `test-tenant-${uniqueId}`,
			email: `test-${uniqueId}@example.com`,
			plan: "FREE",
			is_active: true,
			domain: null,
			logo: null,
			phone: null,
			address: `123 Test Street ${uniqueId}`,
			trial_ends_at: null,
			created_at: new Date(),
			updated_at: new Date(),
			...overrides,
		};
	}

	/**
	 * Create multiple schemas at once
	 */
	static createManySchemas(
		count: number,
		overrides: Partial<TenantSchema> = {},
	): TenantSchema[] {
		return Array.from({ length: count }, () =>
			TenantFactory.createSchema(overrides),
		);
	}

	/**
	 * Reset counter (useful for test isolation)
	 */
	static reset(): void {
		TenantFactory.counter = 0;
	}
}
