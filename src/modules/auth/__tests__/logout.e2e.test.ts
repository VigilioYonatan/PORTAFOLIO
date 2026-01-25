import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import request from "supertest";

describe("Auth Logout (E2E Real DB)", () => {
	const e2e = new E2EApp();

	beforeAll(async () => {
		await e2e.init();
	});

	afterAll(async () => {
		await e2e.close();
	});

	it("should logout successfully", async () => {
		const tenantSlug = "test-logout";
		const registerDto = {
			...UserFactory.createDto(),
			password: "Password123!",
			repeat_password: "Password123!",
			tenant_name: tenantSlug,
			terms_accepted: true,
			phone_number: "1234567890",
		};

		// @ts-expect-error
		delete registerDto.status;
		// @ts-expect-error
		delete registerDto.role_id;

		const agent = request.agent(e2e.app.getHttpServer());

		await agent
			.post("/api/v1/auth/register")
			.set("Host", "localhost")
			.send(registerDto)
			.expect(201);

		await agent
			.post("/api/v1/auth/login")
			.set("Host", `${tenantSlug}.localhost`)
			.send({ email: registerDto.email, password: registerDto.password })
			.expect(200);

		const response = await agent
			.post("/api/v1/auth/logout")
			.set("Host", `${tenantSlug}.localhost`)
			.expect(200);

		expect(response.body.success).toBe(true);
	});
});
