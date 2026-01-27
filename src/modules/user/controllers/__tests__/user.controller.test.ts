import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { type CanActivate, ForbiddenException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Request } from "express";
import { UserQueryClassDto } from "../../dtos/user.query.class.dto";
import { UserService } from "../../services/user.service";
import { UserController } from "../user.controller";

describe("UserController", () => {
	let controller: UserController;
	let userService: UserService;

	const mockUserService = {
		index: vi.fn(),
		show: vi.fn(),
		store: vi.fn(),
		update: vi.fn(),
		updateProfile: vi.fn(),
		changePassword: vi.fn(),
		updateAvatar: vi.fn(),
		resetAttempts: vi.fn(),
		destroy: vi.fn(),
	};

	const mockAuthenticatedGuard: CanActivate = {
		canActivate: vi.fn(() => true),
	};

	const mockRequest = {
		user: { id: 1, role_id: 1 }, // Admin by default
		locals: { tenant: { id: 1 }, user: { id: 1, role_id: 1 } },
	} as unknown as Request;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: mockUserService,
				},
			],
		})
			.overrideGuard(AuthenticatedGuard)
			.useValue(mockAuthenticatedGuard)
			.compile();

		controller = module.get<UserController>(UserController);
		userService = module.get<UserService>(UserService);
		vi.clearAllMocks();
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("index", () => {
		it("should return a paginated list of users", async () => {
			const query: UserQueryClassDto = { limit: 10, offset: 0 };
			const result = {
				data: [],
				meta: { total: 0, limit: 10, offset: 0 },
			};
			mockUserService.index.mockResolvedValue(result);

			const response = await controller.index(mockRequest, query);

			expect(userService.index).toHaveBeenCalledWith(1, query);
			expect(response).toEqual(result);
		});
	});

	describe("show", () => {
		it("should return a user by id", async () => {
			const result = { success: true, user: { id: 2, name: "Test User" } };
			mockUserService.show.mockResolvedValue(result);

			const response = await controller.show(mockRequest, 2);

			expect(userService.show).toHaveBeenCalledWith(1, 2);
			expect(response).toEqual(result);
		});

		it("should throw ForbiddenException if user is not admin and tries to view another user", async () => {
			const userRequest = {
				user: { id: 2, role_id: 2 }, // Regular user
				locals: { tenant: { id: 1 }, user: { id: 2, role_id: 2 } },
			} as unknown as Request;

			await expect(controller.show(userRequest, 3)).rejects.toThrow(
				ForbiddenException,
			);
		});

		it("should allow user to view their own profile even if not admin", async () => {
			const userRequest = {
				user: { id: 2, role_id: 2 },
				locals: { tenant: { id: 1 }, user: { id: 2, role_id: 2 } },
			} as unknown as Request;
			const result = { success: true, user: { id: 2, name: "Me" } };
			mockUserService.show.mockResolvedValue(result);

			const response = await controller.show(userRequest, 2);
			expect(userService.show).toHaveBeenCalledWith(1, 2);
			expect(response).toEqual(result);
		});
	});

	describe("store", () => {
		it("should create a new user", async () => {
			const dto = {
				name: "New User",
				email: "new@example.com",
				password: "password",
				repeat_password: "password",
				role_id: 2,
			};
			// Type assertion for DTO might be needed if strict, but let's try mostly strict
			const result = { success: true, user: { id: 3, ...dto } };
			mockUserService.store.mockResolvedValue(result);

			const response = await controller.store(mockRequest, dto as any); // dto might need type match

			expect(userService.store).toHaveBeenCalledWith(1, dto);
			expect(response).toEqual(result);
		});
	});

	describe("update", () => {
		it("should update a user", async () => {
			const dto = { name: "Updated User" };
			const result = { success: true, user: { id: 2, name: "Updated User" } };
			mockUserService.update.mockResolvedValue(result);

			const response = await controller.update(mockRequest, 2, dto as any);

			expect(userService.update).toHaveBeenCalledWith(1, 2, dto);
			expect(response).toEqual(result);
		});
	});

	describe("destroy", () => {
		it("should delete a user", async () => {
			const result = { success: true, message: "User deleted successfully" };
			mockUserService.destroy.mockResolvedValue(result);

			const response = await controller.destroy(mockRequest, 2);

			expect(userService.destroy).toHaveBeenCalledWith(1, 2);
			expect(response).toEqual(result);
		});
	});
});
