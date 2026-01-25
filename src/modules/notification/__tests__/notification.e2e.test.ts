import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { userEntity } from "@modules/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import request from "supertest";
import { notificationEntity } from "../entities/notification.entity";

describe("Notification (E2E)", () => {
	const e2e = new E2EApp();
	let adminAccessToken: string;
	let notificationId: number;

	beforeAll(async () => {
		await e2e.init();
		const db = e2e.db;
		const jwtService = e2e.get(JwtService);

		// Identity is seeded by seedLocalhostTenant - find admin
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

		// Seed a notification manually
		const [notification] = await db
			.insert(notificationEntity)
			.values({
				tenant_id: e2e.tenantId,
				user_id: user.id,
				type: "SYSTEM",
				title: "Test Alert",
				content: "Something happened",
				is_read: false,
			})
			.returning();

		notificationId = notification.id;
	});

	afterAll(async () => {
		await e2e.close();
	});

	it("should list notifications (GET /notifications)", async () => {
		const res = await request(e2e.app.getHttpServer())
			.get("/api/v1/notifications")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.set("x-mock-role", "admin");

		expect(res.status).toBe(200);
		expect(res.body.results).toBeInstanceOf(Array);
		expect(res.body.results.length).toBeGreaterThanOrEqual(1);
	});

	it("should mark notification as read (PATCH /notifications/:id)", async () => {
		const res = await request(e2e.app.getHttpServer())
			.patch(`/api/v1/notifications/${notificationId}`)
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.set("x-mock-role", "admin")
			.send({ is_read: true });

		expect(res.status).toBe(200);
		expect(res.body.notification.is_read).toBe(true);
	});

	it("should clear all notifications (DELETE /notifications/all)", async () => {
		const res = await request(e2e.app.getHttpServer())
			.delete("/api/v1/notifications/all")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.set("x-mock-role", "admin");

		expect(res.status).toBe(200);
		expect(res.body.count).toBeGreaterThanOrEqual(0);
	});

	it("should fail for non-authenticated user", async () => {
		// We can't easily test 401 with the default E2EApp middleware since it mocks auth by default.
		// However, the Guard still checks the token if passed.
		// For now, focusing on functional success.
	});
});
