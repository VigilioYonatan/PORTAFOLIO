import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { JwtService } from "@nestjs/jwt";
import request from "supertest";

describe("Auth Refresh Token (E2E Real DB)", () => {
	const e2e = new E2EApp();
	let jwtService: JwtService;

	beforeAll(async () => {
		// Note: We want to test REAL auth flow for refresh, so we bypass the mock middleware
		// by NOT providing x-mock-role header in requests that should fail/pass naturally.
		await e2e.init();
		jwtService = e2e.get(JwtService);
	});

	afterAll(async () => {
		await e2e.close();
	});

	it("should refresh token successfully", async () => {
		const tenantSlug = "test-refresh";
		const userDto = {
			email: UserFactory.createDto().email,
			username: UserFactory.createDto().username,
			password: "Password123!",
			repeat_password: "Password123!",
			phone_number: "+1234567890",
			tenant_name: tenantSlug,
			terms_accepted: true,
		};

		const agent = request.agent(e2e.app.getHttpServer());

		await agent
			.post("/api/v1/auth/register")
			.set("Host", "localhost")
			.send(userDto)
			.expect(201);

		const loginResponse = await agent
			.post("/api/v1/auth/login")
			.set("Host", `${tenantSlug}.localhost`)
			.send({ email: userDto.email, password: userDto.password })
			.expect(200);

		const refreshToken = loginResponse.body.refresh_token;
		expect(refreshToken).toBeDefined();

		const refreshResponse = await agent
			.post("/api/v1/auth/refresh")
			.set("Host", `${tenantSlug}.localhost`)
			.send({ refresh_token: refreshToken })
			.expect(200);

		expect(refreshResponse.body.access_token).toBeDefined();

		const decoded = jwtService.decode(refreshResponse.body.access_token) as {
			email: string;
		};
		expect(decoded.email).toBe(userDto.email);
	});
});
