import { UserRepository } from "../user.repository";

describe("UserRepository", () => {
	let repository: UserRepository;

	// Simple mock DB object that mimics the Drizzle interface used in repository
	const mockDb = {
		query: {
			userEntity: {
				findFirst: vi.fn(),
				findMany: vi.fn(),
			},
		},
		select: vi.fn(),
		from: vi.fn(),
		where: vi.fn(),
		insert: vi.fn(),
		values: vi.fn(),
		returning: vi.fn(),
		update: vi.fn(),
		set: vi.fn(),
	};

	// Helper to chain mocks easily
	const setupChain = (mockFn: any) => mockFn.mockReturnThis();

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();

		// Setup chainable methods defaults
		setupChain(mockDb.select);
		setupChain(mockDb.from);
		setupChain(mockDb.where);
		setupChain(mockDb.insert);
		setupChain(mockDb.values);
		setupChain(mockDb.update);
		setupChain(mockDb.set);

		// Manual instantiation
		repository = new UserRepository(mockDb as unknown as any);
	});

	it("should be defined", () => {
		expect(repository).toBeDefined();
	});

	describe("showByEmail", () => {
		it("should return a user if found", async () => {
			const user = { id: 1, email: "test@example.com" };
			mockDb.query.userEntity.findFirst.mockResolvedValue(user);

			const result = await repository.showByEmail(1, "test@example.com");

			expect(mockDb.query.userEntity.findFirst).toHaveBeenCalled();
			expect(result).toEqual(user);
		});

		it("should return null if not found", async () => {
			mockDb.query.userEntity.findFirst.mockResolvedValue(undefined);

			const result = await repository.showByEmail(1, "notfound@example.com");

			expect(result).toBeNull();
		});
	});

	describe("store", () => {
		it("should create and return a user", async () => {
			const newUser = {
				email: "new@example.com",
				username: "New User",
				password: "password",
				phone_number: null,
				google_id: null,
				qr_code_token: null,
				status: "ACTIVE" as "ACTIVE",
				security_stamp: "uuid",
				failed_login_attempts: 0,
				is_mfa_enabled: false,
				is_superuser: false,
				email_verified_at: null,
				lockout_end_at: null,
				mfa_secret: null,
				last_ip_address: null,
				last_login_at: null,
				avatar: null,
				deleted_at: null,
				tenant_id: 1,
				role_id: 2,
			};
			// store returns the inserted user. mock returning() to simulate that.
			const createdUser = { id: 1, ...newUser };
			mockDb.returning.mockResolvedValue([createdUser]);

			const result = await repository.store(1, newUser);

			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.values).toHaveBeenCalled();
			expect(result).toEqual(createdUser);
		});
	});

	describe("update", () => {
		it("should update and return a user", async () => {
			const updateData = { username: "Updated Name" };
			const updatedUser = {
				id: 1,
				username: "Updated Name",
				email: "test@test.com",
				password: "password",
				phone_number: null,
				google_id: null,
				qr_code_token: null,
				status: "ACTIVE" as "ACTIVE",
				security_stamp: "uuid",
				failed_login_attempts: 0,
				is_mfa_enabled: false,
				is_superuser: false,
				email_verified_at: null,
				lockout_end_at: null,
				mfa_secret: null,
				last_ip_address: null,
				last_login_at: null,
				avatar: null,
				deleted_at: null,
				tenant_id: 1,
				role_id: 2,
				created_at: new Date(),
				updated_at: new Date(),
			};
			mockDb.returning.mockResolvedValue([updatedUser]);

			const result = await repository.update(1, 1, updateData);

			expect(mockDb.update).toHaveBeenCalled();
			expect(result).toEqual(updatedUser);
		});
	});
});
