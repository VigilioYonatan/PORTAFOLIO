import {
	seedLocalhostTenant,
	setupTestDb,
} from "@infrastructure/config/server/setup-test-db";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../../app.module";

describe("Conversation - POST /conversation (E2E)", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const db = await setupTestDb();
		await seedLocalhostTenant(db);

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();

		// Use standard config
		const { configureApp } = await import(
			"@infrastructure/config/server/app.config"
		);
		configureApp(app);

		// Mock Auth Middleware for public endpoint
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		app.use((req: any, _res: any, next: any) => {
			req.isAuthenticated = () => false; // Public endpoint
			req.user = undefined;
			next();
		});

		await app.init();
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});

	describe("POST /api/v1/conversation (16.1)", () => {
		it("should create a new conversation for an anonymous visitor", async () => {
			const body = {
				visitor_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				title: "Nueva conversación de prueba",
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send(body);

			if (response.status !== 201) {
				// biome-ignore lint/suspicious/noConsole: <explanation>
				console.log("Conversation Create Failure:", response.body);
			}

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.conversation).toBeDefined();
			expect(response.body.conversation.visitor_id).toBe(body.visitor_id);
			expect(response.body.conversation.title).toBe(body.title);
			expect(response.body.conversation.mode).toBe("AI");
			expect(response.body.conversation.is_active).toBe(true);
		});

		it("should create a conversation without authentication (public endpoint)", async () => {
			const body = {
				visitor_id: "a47bc20b-68dc-5382-b678-1f13c3d4e580",
				title: "Conversación pública",
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send(body);

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
		});

		it("should fail with invalid visitor_id (not UUID)", async () => {
			const body = {
				visitor_id: "not-a-valid-uuid",
				title: "Test conversation",
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send(body);

			expect(response.status).toBe(400);
		});

		it("should fail without required fields", async () => {
			const body = {};

			const response = await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send(body);

			expect(response.status).toBe(400);
		});

		it("should fail with empty title", async () => {
			const body = {
				visitor_id: "c57de30c-78ec-6392-c789-2a24d4e5f691",
				title: "",
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send(body);

			expect(response.status).toBe(400);
		});

		it("should fail with title too long (over 200 chars)", async () => {
			const body = {
				visitor_id: "d68ef41d-89fd-7403-d890-3b35e5f6g702",
				title: "A".repeat(201),
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send(body);

			expect(response.status).toBe(400);
		});
	});
});
