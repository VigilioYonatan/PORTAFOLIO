import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { userEntity } from "@modules/user/entities/user.entity";
import { UserService } from "@modules/user/services/user.service";
import { and, eq } from "drizzle-orm";
import request from "supertest";

describe("MFA Setup (E2E)", () => {
	const e2e = new E2EApp();
	let userService: UserService;

	beforeAll(async () => {
		await e2e.init();
		userService = e2e.get(UserService);
	});

	afterAll(async () => {
		await e2e.close();
	});

	it("should generate MFA secret and QR code for authenticated user", async () => {
		const userDto = UserFactory.createDto();
		const { user } = await userService.store(e2e.tenantId, userDto);

		const loginRes = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/login")
			.set("Host", "localhost")
			.send({ email: userDto.email, password: userDto.password });

		const accessToken = loginRes.body.access_token;
		expect(accessToken).toBeDefined();

		const response = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/mfa/setup")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.send();

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.secret).toBeDefined();

		const userInDb = await e2e.db.query.userEntity.findFirst({
			where: and(
				eq(userEntity.id, user.id),
				eq(userEntity.tenant_id, e2e.tenantId),
			),
		});
		expect(userInDb?.is_mfa_enabled).toBe(false);
	});

	it("should return 400 if MFA is already enabled", async () => {
		const userDto = UserFactory.createDto();
		const { user } = await userService.store(e2e.tenantId, userDto);

		const loginRes = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/login")
			.set("Host", "localhost")
			.send({ email: userDto.email, password: userDto.password });
		const accessToken = loginRes.body.access_token;

		await e2e.db
			.update(userEntity)
			.set({ is_mfa_enabled: true, mfa_secret: "ALREADYENABLED" })
			.where(eq(userEntity.id, user.id));

		const response = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/mfa/setup")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.send();

		expect(response.status).toBe(400);
	});
});
