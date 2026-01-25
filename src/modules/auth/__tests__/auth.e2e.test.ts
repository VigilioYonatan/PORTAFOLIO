import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { userEntity } from "@modules/user/entities/user.entity";
import { UserService } from "@modules/user/services/user.service";
import { eq } from "drizzle-orm";
import request from "supertest";

describe("AuthController (E2E Real DB)", () => {
	const e2e = new E2EApp();
	let userService: UserService;

	beforeAll(async () => {
		await e2e.init();
		userService = e2e.get(UserService);
	});

	afterAll(async () => {
		await e2e.close();
	});

	it("should login successfully with valid credentials", async () => {
		// 1. Create User
		const userDto = UserFactory.createDto();
		await userService.store(e2e.tenantId, userDto);

		// 2. Login
		const loginDto = {
			email: userDto.email,
			password: userDto.password,
		};

		const response = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/login")
			.set("Host", "localhost")
			.send(loginDto);

		expect(response.status).toBe(200);
		expect(response.body.access_token).toBeDefined();
		expect(response.body.user.email).toBe(userDto.email);
	});

	it("should fail validation with invalid credentials", async () => {
		const loginDto = {
			email: "wrong@example.com",
			password: "wrongpassword",
		};

		const response = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/login")
			.set("Host", "localhost")
			.send(loginDto);

		expect(response.status).toBe(401);
	});

	it("should register a new tenant and user successfully", async () => {
		const registerDto = {
			email: "newuser@example.com",
			username: "newuser",
			password: "Password123!",
			repeat_password: "Password123!",
			tenant_name: "New Tenant",
			terms_accepted: true,
		};

		const response = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/register")
			.send(registerDto);

		expect(response.status).toBe(201);
		expect(response.body.user.email).toBe(registerDto.email);
	});
});
