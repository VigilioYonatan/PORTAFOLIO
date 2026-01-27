import { E2EApp } from "@infrastructure/config/server/e2e-app";
import request from "supertest";

describe("Contact (E2E)", () => {
	const e2e = new E2EApp();

	beforeAll(async () => {
		await e2e.init();
	});

	afterAll(async () => {
		await e2e.close();
	});

	describe("POST /api/v1/contact-message", () => {
		it("should record a contact message via tenant host", async () => {
			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/contact-message")
				.set("Host", "localhost")
				.send({
					name: "John Doe",
					email: "john@example.com",
					phone_number: null,
					subject: null,
					message:
						"Hello, this is a test message with at least ten characters.",
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.message.tenant_id).toBe(e2e.tenantId);
		});

		it("should record a contact message without tenant context", async () => {
			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/contact-message")
				.set("Host", "unknown-host.com")
				.send({
					name: "Jane Smith",
					email: "jane@example.com",
					phone_number: null,
					subject: null,
					message: "Another test message for global contact.",
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.message.tenant_id).toBeNull();
		});

		it("should fail with invalid email", async () => {
			await request(e2e.app.getHttpServer())
				.post("/api/v1/contact-message")
				.set("Host", "localhost")
				.send({
					name: "John Doe",
					email: "invalid-email",
					phone_number: null,
					subject: null,
					message: "Test message.",
				})
				.expect(400);
		});
	});

	describe("GET /api/v1/contact-message", () => {
		it("should list contact contact for admin", async () => {
			await request(e2e.app.getHttpServer())
				.post("/api/v1/contact-message")
				.set("Host", "localhost")
				.send({
					name: "Lister",
					email: "list@example.com",
					message: "Message to be listed 1234567890",
					phone_number: null,
					subject: null,
				});

			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/contact-message")
				.set("Host", "localhost")
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.results)).toBe(true);
		});
	});

	describe("PATCH /api/v1/contact-message/:id", () => {
		it("should mark contact message as read", async () => {
			const created = await request(e2e.app.getHttpServer())
				.post("/api/v1/contact-message")
				.set("Host", "localhost")
				.send({
					name: "Reader",
					email: "read@example.com",
					message: "Message to be read 1234567890",
					phone_number: null,
					subject: null,
				});

			const id = created.body.message.id;

			const response = await request(e2e.app.getHttpServer())
				.patch(`/api/v1/contact-message/${id}`)
				.send({ is_read: true })
				.set("Host", "localhost")
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.message.is_read).toBe(true);
		});
	});

	describe("DELETE /api/v1/contact-message/:id", () => {
		it("should delete contact message", async () => {
			const created = await request(e2e.app.getHttpServer())
				.post("/api/v1/contact-message")
				.set("Host", "localhost")
				.send({
					name: "To Delete",
					email: "delete@example.com",
					message: "Message to be deleted 1234567890",
					phone_number: null,
					subject: null,
				});

			const id = created.body.message.id;

			const response = await request(e2e.app.getHttpServer())
				.delete(`/api/v1/contact-message/${id}`)
				.set("Host", "localhost")
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});
});
