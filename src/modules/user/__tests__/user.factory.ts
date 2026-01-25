import type { UserStoreDto } from "../dtos/user.store.dto";
import type { UserSchema } from "../schemas/user.schema";

/**
 * Factory for generating unique User test data
 * Senior Practice: Uses timestamp + counter for parallel test isolation
 */
export class UserFactory {
	private static counter = 0;

	private static getUniqueId(): string {
		UserFactory.counter++;
		return `${Date.now()}-${UserFactory.counter}-${Math.random()
			.toString(36)
			.substring(7)}`;
	}

	/**
	 * Create a valid UserStoreDto with unique values
	 * Note: Password must meet complexity requirements
	 */
	static createDto(overrides: Partial<UserStoreDto> = {}): UserStoreDto {
		const uniqueId = UserFactory.getUniqueId();
		const password = "Password@1234!"; // Meets complexity: upper, lower, digit, special
		return {
			username: `testuser_${uniqueId}`,
			email: `testuser_${uniqueId}@example.com`,
			password,
			repeat_password: password,
			status: "ACTIVE",
			role_id: 1,
			...overrides,
		};
	}

	/**
	 * Create multiple DTOs at once
	 */
	static createManyDtos(
		count: number,
		overrides: Partial<UserStoreDto> = {},
	): UserStoreDto[] {
		return Array.from({ length: count }, () =>
			UserFactory.createDto(overrides),
		);
	}

	/**
	 * Create a mock UserSchema (for unit tests)
	 */
	static createSchema(overrides: Partial<UserSchema>): UserSchema {
		const uniqueId = UserFactory.getUniqueId();
		return {
			id: Math.floor(Math.random() * 10000) + 1000,
			username: `testuser_${uniqueId}`,
			email: `testuser_${uniqueId}@example.com`,
			phone_number: null,
			password: "$2b$10$hashedemptyhash", // Hashed password placeholder
			google_id: null,
			qr_code_token: null,
			status: "ACTIVE",
			security_stamp: crypto.randomUUID(),
			failed_login_attempts: 0,
			is_mfa_enabled: false,
			is_superuser: false,
			email_verified_at: null,
			lockout_end_at: null,
			avatar: null,
			role_id: 1,
			mfa_secret: null,
			last_ip_address: null,
			last_login_at: null,
			deleted_at: null,
			tenant_id: 1,
			created_at: new Date(),
			updated_at: new Date(),
			...overrides,
		};
	}

	/**
	 * Alias for createSchema to be used in Auth tests
	 */
	static createAuthUser(overrides: Partial<UserSchema> = {}): UserSchema {
		return UserFactory.createSchema(overrides);
	}

	static reset(): void {
		UserFactory.counter = 0;
	}
}
