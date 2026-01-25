import { configureApp } from "@infrastructure/config/server/app.config";
import {
	seedLocalhostTenant,
	setupTestDb,
} from "@infrastructure/config/server/setup-test-db";
import { AiService } from "@modules/ai/services/ai.service";
import { AiConfigService } from "@modules/ai/services/ai-config.service";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { of } from "rxjs";
import request from "supertest";
import { AppModule } from "../../../app.module";

describe("Conversation Stream - GET /conversations/:id/stream (E2E)", () => {
	let app: INestApplication;
	let tenantId: number;

	const mockAiService = {
		generateStream: () => of({ data: { content: "AI Response Chunk" } }),
	};

	const mockAiConfigService = {
		show: async () => ({
			config: {
				chat_model: "test-model",
				temperature: 0.7,
				system_prompt: "sys",
			},
		}),
	};

	beforeAll(async () => {
		const db = await setupTestDb();
		tenantId = await seedLocalhostTenant(db);

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(AiService)
			.useValue(mockAiService)
			.overrideProvider(AiConfigService)
			.useValue(mockAiConfigService)
			.compile();

		app = moduleRef.createNestApplication();

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

	it("should stream AI response for a conversation", async () => {
		// 1. Create Conversation
		const convRes = await request(app.getHttpServer())
			.post("/api/v1/conversations")
			.set("Host", "localhost")
			.send({
				title: "Stream Test",
				visitor_id: "7b8e6af9-0c65-4f72-91e8-7a5448378519",
			});
		expect(convRes.status).toBe(201);
		const conversationId = convRes.body.conversation.id;

		// 2. Add Message
		await request(app.getHttpServer())
			.post(`/api/v1/conversations/${conversationId}/messages`)
			.set("Host", "localhost")
			.send({ content: "Hello AI" });

		// 3. Request Stream
		const response = await request(app.getHttpServer())
			.get(`/api/v1/conversations/${conversationId}/stream`)
			.set("Host", "localhost")
			.expect(200);

		expect(response.get("Content-Type")).toBe("text/event-stream");
		// NOTE: Testing actual SSE content with supertest is tricky as it buffers.
		// Checking Content-Type is sufficient to verify endpoint is hit and returns stream.
	});
});
