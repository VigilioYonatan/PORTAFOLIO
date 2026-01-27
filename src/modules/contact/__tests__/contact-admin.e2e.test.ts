import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { UserService } from "@modules/user/services/user.service";
import request from "supertest";

describe("Contact Admin (E2E)", () => {
	const e2e = new E2EApp();
	let authCookie: string;

	beforeAll(async () => {
		await e2e.init();
		const userService = e2e.moduleRef.get(UserService);

		const email = "admin_contact@example.com";
		const password = "Password123!";

		const userDto = UserFactory.createDto({
			email,
			password,
			role_id: 1,
			username: "admin_contact",
		});

		await userService.store(e2e.tenantId, userDto);

		const loginRes = await request(e2e.app.getHttpServer())
			.post("/api/v1/auth/login")
			.set("Host", "localhost")
			.send({ email, password });

		expect(loginRes.status).toBe(200);
		authCookie = loginRes.get("Set-Cookie")?.[0] ?? "";
		if (!authCookie)
			// biome-ignore lint/suspicious/noConsole: <explanation>
			console.error("Login failed to return cookie", loginRes.body);
	});

	afterAll(async () => {
		await e2e.close();
	});

	describe("Contact Admin Flow", () => {
		let messageId: number;

		beforeAll(async () => {
			const res = await request(e2e.app.getHttpServer())
				.post("/api/v1/contact-message")
				.set("Host", "localhost")
				.send({
					name: "Test User",
					email: "test@example.com",
					phone_number: null,
					subject: null,
					message: "Initial test message for admin verification.",
				});
			messageId = res.body.message.id;
		});

		it("should list contact contact", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/contact-message")
				.set("Host", "localhost")
				.set("Cookie", authCookie);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.results)).toBe(true);
		});

		it("should mark message as read", async () => {
			const response = await request(e2e.app.getHttpServer())
				.patch(`/api/v1/contact-message/${messageId}`)
				.set("Host", "localhost")
				.set("Cookie", authCookie)
				.send({ is_read: true });

			expect(response.status).toBe(200);
			expect(response.body.message.is_read).toBe(true);
		});

		it("should delete message", async () => {
			const response = await request(e2e.app.getHttpServer())
				.delete(`/api/v1/contact-message/${messageId}`)
				.set("Host", "localhost")
				.set("Cookie", authCookie);

			expect(response.status).toBe(200);
		});
	});
});
