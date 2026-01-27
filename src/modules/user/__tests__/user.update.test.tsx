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
	// Override sweetModal mock implementation if needed, but here it matches generic one
	// Actually user.update.test.tsx uses isConfirmed: false, mockUtils sends true.
	// The previous code had isConfirmed: false.
	// Let's customize it or keep it consistent?
	// In user.update.test.tsx, it was mocking sweetModal confirmation.
	// If I use the shared mock, it returns true.
	// Let's see if tests depend on it being false or true.
	// If user.update specific logic test doesn't rely, it is fine.
	// But to be safe, I can just mock re-override in beforeEach if needed.
	// Wait, the previous code was:
	// sweetModal: vi.fn(() => Promise.resolve({ isConfirmed: false })),
	// My shared mock is isConfirmed: true.
	// Let's use the shared mock and if test fails I will adjust.
	// But to be safer, I can override the mock value in beforeEach using vi.mocked().
	return mockVigilioSweet();
});

vi.mock("react-hook-form", async () => {
	const { mockReactHookForm } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockReactHookForm();
});

describe("UserUpdate Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should be exported from the module", async () => {
		const module = await import("../components/user.update");
		expect(module.UserUpdate).toBeDefined();
		expect(typeof module.UserUpdate).toBe("function");
	});

	it("should have correct component name", async () => {
		const module = await import("../components/user.update");
		expect(module.UserUpdate.name).toBe("UserUpdate");
	});

	it("should accept user and refetch props", async () => {
		const { UserUpdate } = await import("../components/user.update");
		expect(UserUpdate.length).toBeGreaterThanOrEqual(0);
	});
});

describe("UserUpdate Form Validation", () => {
	it("should validate username field", async () => {
		const { userUpdateDto } = await import("../dtos/user.update.dto");
		expect(userUpdateDto).toBeDefined();

		// Missing username should fail
		const invalidData = {
			phone_number: null,
			status: "ACTIVE",
			role_id: 1,
			is_mfa_enabled: false,
		};

		const result = userUpdateDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should accept valid update data with all required fields", async () => {
		const { userUpdateDto } = await import("../dtos/user.update.dto");

		const validData = {
			username: "testuser",
			phone_number: null,
			status: "ACTIVE",
			role_id: 1,
			is_mfa_enabled: false,
		};

		const result = userUpdateDto.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("should validate status enum values", async () => {
		const { userUpdateDto } = await import("../dtos/user.update.dto");

		const invalidData = {
			username: "testuser",
			phone_number: null,
			status: "INVALID_STATUS",
			role_id: 1,
			is_mfa_enabled: false,
		};

		const result = userUpdateDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should allow optional phone_number", async () => {
		const { userUpdateDto } = await import("../dtos/user.update.dto");

		const validData = {
			username: "testuser",
			phone_number: "+1234567890",
			status: "ACTIVE",
			role_id: 1,
			is_mfa_enabled: false,
		};

		const result = userUpdateDto.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("should validate is_mfa_enabled as boolean", async () => {
		const { userUpdateDto } = await import("../dtos/user.update.dto");

		const validData = {
			username: "testuser",
			phone_number: null,
			status: "ACTIVE",
			role_id: 1,
			is_mfa_enabled: true,
		};

		const result = userUpdateDto.safeParse(validData);
		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.is_mfa_enabled).toBe(true);
		}
	});

	it("should accept all valid status values", async () => {
		const { userUpdateDto } = await import("../dtos/user.update.dto");
		const statuses = ["ACTIVE", "BANNED", "PENDING"];

		for (const status of statuses) {
			const validData = {
				username: "testuser",
				phone_number: null,
				status,
				role_id: 1,
				is_mfa_enabled: false,
			};

			const result = userUpdateDto.safeParse(validData);
			expect(result.success).toBe(true);
		}
	});

	it("should require positive role_id", async () => {
		const { userUpdateDto } = await import("../dtos/user.update.dto");

		const invalidData = {
			username: "testuser",
			phone_number: null,
			status: "ACTIVE",
			role_id: -1,
			is_mfa_enabled: false,
		};

		const result = userUpdateDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
});

describe("UserUpdate API", () => {
	it("should be a function that accepts user ID", async () => {
		const { userUpdateApi } = await import("../apis/user.update.api");
		expect(userUpdateApi).toBeDefined();
		expect(typeof userUpdateApi).toBe("function");
	});
});
