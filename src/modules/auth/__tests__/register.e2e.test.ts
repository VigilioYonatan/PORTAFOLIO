import { E2EApp } from "@infrastructure/config/server/e2e-app";
import request from "supertest";

describe("Auth Register (E2E Real DB)", () => {
	const e2e = new E2EApp();

	beforeAll(async () => {
		await e2e.init();
	});

	afterAll(async () => {
		await e2e.close();
	});

	it("should register successfully with valid data", async () => {
		const registerDto = {
			email: "newuser@example.com",
			username: "newuser",
			password: "Password123!",
			repeat_password: "Password123!",
			phone_number: "+1234567890",
			tenant_name: "test_tenant",
			terms_accepted: true,
		};

		const response = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/register")
			.set("Host", "localhost")
			.send(registerDto)
			.expect(201);

		expect(response.body).toHaveProperty("access_token");
		expect(response.body.user).toHaveProperty("email", registerDto.email);
	});

	it("should fail validation with password mismatch", async () => {
		const registerDto = {
			email: "mismatch@example.com",
			username: "mismatch",
			password: "Password123!",
			repeat_password: "Password1234!",
			phone_number: "+1234567890",
			tenant_name: "test_tenant2",
			terms_accepted: true,
		};

		await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/register")
			.set("Host", "localhost")
			.send(registerDto)
			.expect(400);
	});

	it("should fail with duplicate email", async () => {
		const registerDto = {
			email: "duplicate@example.com",
			username: "duplicate",
			password: "Password123!",
			repeat_password: "Password123!",
			phone_number: "+1234567890",
			tenant_name: "test_tenant3",
			terms_accepted: true,
		};

		await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/register")
			.set("Host", "localhost")
			.send(registerDto)
			.expect(201);

		const response = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/register")
			.set("Host", "localhost")
			.send(registerDto)
			.expect(409);

		expect(response.status).toBe(409);
	});
});
