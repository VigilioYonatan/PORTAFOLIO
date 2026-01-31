import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { userEntity } from "@modules/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import request from "supertest";

describe("User Module (E2E)", () => {
	const e2e = new E2EApp();
	let adminAccessToken: string;

	beforeAll(async () => {
		await e2e.init();
		const db = e2e.db;
		const jwtService = e2e.moduleRef.get(JwtService);

		// Find admin user seeded by seedLocalhostTenant
		const [user] = await db
			.select()
			.from(userEntity)
			.where(eq(userEntity.role_id, 1))
			.limit(1);

		adminAccessToken = jwtService.sign({
			sub: user.id,
			email: user.email,
			tenant_id: e2e.tenantId,
			security_stamp: user.security_stamp,
		});
	});

	afterAll(async () => {
		await e2e.close();
	});

	describe("Admin User Management", () => {
		it("should list users (GET /users)", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/user")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.results)).toBe(true);
		});

		it("should create a new user (POST /users)", async () => {
			const { faker } = await import("@faker-js/faker");

			const newUser = {
				username: faker.internet.username(),
				email: faker.internet.email(),
				password: "Password123!",
				repeat_password: "Password123!",
				role_id: 2,
				status: "ACTIVE",
			};

			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/user")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(newUser);

			expect(response.status).toBe(201);
			expect(response.body.user.email).toBe(newUser.email);
		});
	});

	describe("User Profile (/me)", () => {
		it("should return own profile (GET /users/me)", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/user/me")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.user).toHaveProperty("email");
			expect(response.body.user).not.toHaveProperty("password");
		});

		it("should update own profile (PATCH /users/me)", async () => {
			const updateData = {
				username: "updated_admin_me",
				avatar: null,
			};

			const response = await request(e2e.app.getHttpServer())
				.patch("/api/v1/user/me")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(updateData);

			expect(response.status).toBe(200);
			expect(response.body.user.username).toBe(updateData.username);
		});
	});
});
