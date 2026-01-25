import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { UserCache } from "../cache/user.cache";
import { UserRepository } from "../repositories/user.repository";
import type { UserSchema } from "../schemas/user.schema";
import { UserService } from "../services/user.service";

describe("UserService", () => {
	let service: UserService;
	let repository: UserRepository;
	let cache: UserCache;

	const mockRepository = {
		index: vi.fn(),
		showById: vi.fn(),
		store: vi.fn(),
		update: vi.fn(),
		destroy: vi.fn(),
	};

	const mockCache = {
		get: vi.fn(),
		set: vi.fn(),
		invalidate: vi.fn(),
		invalidateByEmail: vi.fn(),
		getList: vi.fn(),
		setList: vi.fn(),
		invalidateLists: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: UserRepository, useValue: mockRepository },
				{ provide: UserCache, useValue: mockCache },
			],
		}).compile();

		service = module.get<UserService>(UserService);
		repository = module.get<UserRepository>(UserRepository);
		cache = module.get<UserCache>(UserCache);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("index", () => {
		it("should return users from cache if available", async () => {
			const tenant_id = 1;
			const query = { limit: 10, offset: 0 };
			const mockUsers = [{ id: 1 }] as UserSchema[];

			mockCache.getList.mockResolvedValue([mockUsers, 1]);

			const result = await service.index(tenant_id, query);

			expect(cache.getList).toHaveBeenCalledWith(
				tenant_id,
				expect.objectContaining(query),
			);
			expect(repository.index).not.toHaveBeenCalled();
			expect(result.results).toEqual(mockUsers);
		});

		it("should return users from db if not in cache", async () => {
			const tenant_id = 1;
			const query = { limit: 10, offset: 0 };
			const mockUsers = [{ id: 1 }] as UserSchema[];

			mockCache.getList.mockResolvedValue(null);
			mockRepository.index.mockResolvedValue([mockUsers, 1]);

			const result = await service.index(tenant_id, query);

			expect(repository.index).toHaveBeenCalledWith(
				tenant_id,
				expect.objectContaining(query),
			);
			expect(cache.setList).toHaveBeenCalledWith(
				tenant_id,
				expect.objectContaining(query),
				[mockUsers, 1],
			);
			expect(result.results).toEqual(mockUsers);
		});
	});

	describe("show", () => {
		it("should return user from cache if available", async () => {
			const tenant_id = 1;
			const id = 1;
			const mockUser = { id } as UserSchema;

			mockCache.get.mockResolvedValue(mockUser);

			const result = await service.show(tenant_id, id);

			expect(cache.get).toHaveBeenCalledWith(tenant_id, id);
			expect(repository.showById).not.toHaveBeenCalled();
			expect(result).toEqual({ success: true, user: mockUser });
		});

		it("should return user from db if not in cache", async () => {
			const tenant_id = 1;
			const id = 1;
			const mockUser = { id } as UserSchema;

			mockCache.get.mockResolvedValue(null);
			mockRepository.showById.mockResolvedValue(mockUser);

			const result = await service.show(tenant_id, id);

			expect(repository.showById).toHaveBeenCalledWith(tenant_id, id);
			expect(cache.set).toHaveBeenCalledWith(tenant_id, mockUser);
			expect(result).toEqual({ success: true, user: mockUser });
		});

		it("should throw NotFoundException if user not found", async () => {
			const tenant_id = 1;
			const id = 1;

			mockCache.get.mockResolvedValue(null);
			mockRepository.showById.mockResolvedValue(null);

			await expect(service.show(tenant_id, id)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("store", () => {
		it("should create a user and cache it", async () => {
			const tenant_id = 1;
			const body = {
				email: "test@example.com",
				password: "Password123!",
				username: "Test User",
				role_id: 2,
				repeat_password: "Password123!",
				status: "ACTIVE" as const,
			};
			const newUser = {
				id: 1,
				...body,
				phone_number: null,
				status: "ACTIVE",
			} as unknown as UserSchema;

			mockRepository.store.mockResolvedValue(newUser);

			const result = await service.store(tenant_id, body);

			expect(repository.store).toHaveBeenCalledWith(
				tenant_id,
				expect.objectContaining({ email: body.email }),
			);
			expect(cache.set).toHaveBeenCalledWith(tenant_id, newUser);
			expect(cache.invalidateLists).toHaveBeenCalledWith(tenant_id);
			expect(result).toEqual({ success: true, user: newUser });
		});
	});

	describe("update", () => {
		it("should update a user and invalidate cache", async () => {
			const tenant_id = 1;
			const id = 1;
			const body = { username: "Updated" };
			const updatedUser = { id, ...body } as UserSchema;

			mockRepository.update.mockResolvedValue(updatedUser);

			const result = await service.update(tenant_id, id, body);

			expect(repository.update).toHaveBeenCalledWith(tenant_id, id, body);
			expect(cache.invalidate).toHaveBeenCalledWith(tenant_id, id);
			expect(cache.invalidateLists).toHaveBeenCalledWith(tenant_id);
			expect(result).toEqual({ success: true, user: updatedUser });
		});
	});

	describe("destroy", () => {
		it("should delete a user and invalidate cache", async () => {
			const tenant_id = 1;
			const id = 1;

			// mock empty result or whatever destroy returns (usually just success or the deleted entity)
			mockRepository.destroy.mockResolvedValue({ id } as UserSchema);

			const result = await service.destroy(tenant_id, id);

			expect(repository.destroy).toHaveBeenCalledWith(tenant_id, id);
			expect(cache.invalidate).toHaveBeenCalledWith(tenant_id, id);
			expect(cache.invalidateLists).toHaveBeenCalledWith(tenant_id);
			expect(result).toEqual({
				success: true,
				message: "User deleted successfully",
			});
		});
	});
});
