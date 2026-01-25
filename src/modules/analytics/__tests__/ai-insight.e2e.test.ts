import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { aiModelConfigEntity } from "@modules/ai/entities/ai-config.entity";
import { AiService } from "@modules/ai/services/ai.service";
import { aiInsightEntity } from "@modules/analytics/entities/ai-insight.entity";
import { chatMessageEntity } from "@modules/chat/entities/chat-message.entity";
import { conversationEntity } from "@modules/chat/entities/conversation.entity";
import { userEntity } from "@modules/user/entities/user.entity";
import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { of } from "rxjs";
import request from "supertest";
import { vi } from "vitest";

describe("AiInsightController (e2e)", () => {
	const e2e = new E2EApp();
	let appDb: any;
	let jwtService: JwtService;
	let adminAccessToken: string;

	const mockAiService = {
		show: vi.fn(),
		generateStream: vi.fn(),
	};

	beforeAll(async () => {
		await e2e.init({
			overrides: (builder) =>
				builder.overrideProvider(AiService).useValue(mockAiService),
		});

		appDb = e2e.getDb();
		jwtService = e2e.get(JwtService);

		// Identity is seeded by seedLocalhostTenant in E2EApp.init()
		const [admin] = await appDb
			.select()
			.from(userEntity)
			.where(eq(userEntity.role_id, 1))
			.limit(1);

		// Setup AI Config
		const [config] = await appDb
			.insert(aiModelConfigEntity)
			.values({
				tenant_id: e2e.tenantId,
				chat_model: "gpt-4",
				embedding_model: "text-embedding-3-small",
				is_active: true,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		mockAiService.show.mockResolvedValue({
			success: true,
			config: { id: config.id, is_active: true, chat_model: "gpt-4" },
		});

		adminAccessToken = jwtService.sign({
			sub: admin.id,
			email: admin.email,
			role: 1,
			tenant_id: e2e.tenantId,
		});
	});

	afterAll(async () => {
		await e2e.close();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("POST /analytics/insights/generate", () => {
		it("should generate insights from conversations", async () => {
			const [conv] = await appDb
				.insert(conversationEntity)
				.values({
					tenant_id: e2e.tenantId,
					title: "Test Conversation",
					ip_address: "127.0.0.1",
					visitor_id: "550e8400-e29b-41d4-a716-446655440000",
				})
				.returning();

			await appDb.insert(chatMessageEntity).values([
				{
					conversation_id: conv.id,
					tenant_id: e2e.tenantId,
					role: "USER",
					content: "I want to know about your React experience.",
				},
				{
					conversation_id: conv.id,
					tenant_id: e2e.tenantId,
					role: "ASSISTANT",
					content: "I have 5 years of experience with React.",
				},
			]);

			mockAiService.generateStream.mockResolvedValue(
				of({
					data: {
						content: JSON.stringify({
							themes: ["React", "Experience"],
							sentiment: "POSITIVE",
							actions: ["Highlight React projects"],
						}),
					},
				}),
			);

			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/analytics/insights/generate")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("Host", "localhost")
				.set("x-mock-role", "admin")
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.insight).toBeDefined();
		});
	});

	describe("GET /analytics/insights", () => {
		it("should list generated insights", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/analytics/insights")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("Host", "localhost")
				.set("x-mock-role", "admin")
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.results)).toBe(true);
		});
	});
});
