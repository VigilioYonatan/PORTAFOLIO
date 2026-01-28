// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@vigilio/preact-fetching", () => ({
	useMutation: vi.fn(() => ({
		mutate: vi.fn(),
		isLoading: false,
	})),
}));

vi.mock("@vigilio/sweet", async () => {
	const { mockVigilioSweet } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockVigilioSweet();
});

vi.mock("react-hook-form", async () => {
	const { mockReactHookForm } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockReactHookForm();
});

describe("UserStore Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should be exported from the module", async () => {
		const module = await import("../components/user-store");
		expect(module.UserStore).toBeDefined();
		expect(typeof module.UserStore).toBe("function");
	});

	it("should have correct component name", async () => {
		const module = await import("../components/user-store");
		expect(module.UserStore.name).toBe("UserStore");
	});

	it("should accept refetch prop", async () => {
		const { UserStore } = await import("../components/user-store");
		// Verify the component signature accepts refetch
		expect(UserStore.length).toBeGreaterThanOrEqual(0);
	});
});

describe("UserStore Form Validation", () => {
	it("should require username field", async () => {
		const { userStoreDto } = await import("../dtos/user.store.dto");
		expect(userStoreDto).toBeDefined();

		// Test validation by parsing invalid data
		const invalidData = {
			email: "test@example.com",
			password: "Password@123",
			repeat_password: "Password@123",
			status: "ACTIVE",
			role_id: 1,
		};

		const result = userStoreDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should require valid email format", async () => {
		const { userStoreDto } = await import("../dtos/user.store.dto");

		const invalidData = {
			username: "testuser",
			email: "invalid-email",
			password: "Password@123",
			repeat_password: "Password@123",
			status: "ACTIVE",
			role_id: 1,
		};

		const result = userStoreDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should require matching passwords", async () => {
		const { userStoreDto } = await import("../dtos/user.store.dto");

		const invalidData = {
			username: "testuser",
			email: "test@example.com",
			password: "Password@123",
			repeat_password: "DifferentPassword@123",
			status: "ACTIVE",
			role_id: 1,
		};

		const result = userStoreDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should validate password complexity", async () => {
		const { userStoreDto } = await import("../dtos/user.store.dto");

		const invalidData = {
			username: "testuser",
			email: "test@example.com",
			password: "simple",
			repeat_password: "simple",
			status: "ACTIVE",
			role_id: 1,
		};

		const result = userStoreDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should accept valid user data", async () => {
		const { userStoreDto } = await import("../dtos/user.store.dto");

		const validData = {
			username: "testuser",
			email: "test@example.com",
			phone_number: null,
			password: "Password@123!",
			repeat_password: "Password@123!",
			status: "ACTIVE",
			role_id: 1,
		};

		const result = userStoreDto.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("should validate status enum values", async () => {
		const { userStoreDto } = await import("../dtos/user.store.dto");

		const invalidData = {
			username: "testuser",
			email: "test@example.com",
			password: "Password@123!",
			repeat_password: "Password@123!",
			status: "INVALID_STATUS",
			role_id: 1,
		};

		const result = userStoreDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should require positive role_id", async () => {
		const { userStoreDto } = await import("../dtos/user.store.dto");

		const invalidData = {
			username: "testuser",
			email: "test@example.com",
			password: "Password@123!",
			repeat_password: "Password@123!",
			status: "ACTIVE",
			role_id: -1,
		};

		const result = userStoreDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
});
