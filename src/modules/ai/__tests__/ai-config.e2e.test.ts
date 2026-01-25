import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { userEntity } from "@modules/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import request from "supertest";

describe("AI Config (E2E)", () => {
	const e2e = new E2EApp();
	let ownerToken: string;
	let userToken: string;

	beforeAll(async () => {
		await e2e.init();
		const db = e2e.db;
		const jwtService = e2e.moduleRef.get(JwtService);

		// Get all users seeded for this tenant
		const users = await db
			.select()
			.from(userEntity)
			.where(eq(userEntity.tenant_id, e2e.tenantId));

		const owner = users.find((u) => u.role_id === 1);
		const regularUser = users.find((u) => u.role_id === 2);

		if (!owner || !regularUser) {
			throw new Error(
				`Seed failed to provide required roles (Admin: ${!!owner}, User: ${!!regularUser})`,
			);
		}

		ownerToken = jwtService.sign({
			sub: owner.id,
			email: owner.email,
			tenant_id: e2e.tenantId,
			security_stamp: owner.security_stamp,
		});

		userToken = jwtService.sign({
			sub: regularUser.id,
			email: regularUser.email,
			tenant_id: e2e.tenantId,
			security_stamp: regularUser.security_stamp,
		});
	});

	afterAll(async () => {
		await e2e.close();
	});

	it("should get AI config as Owner", async () => {
		const res = await request(e2e.app.getHttpServer())
			.get("/api/v1/ai-config")
			.set("Authorization", `Bearer ${ownerToken}`)
			.set("Host", "localhost");

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("config");
	});

	it("should fail to get AI config as User (Role 2)", async () => {
		const res = await request(e2e.app.getHttpServer())
			.get("/api/v1/ai-config")
			.set("Authorization", `Bearer ${userToken}`)
			.set("Host", "localhost");

		expect(res.status).toBe(403);
	});
});
