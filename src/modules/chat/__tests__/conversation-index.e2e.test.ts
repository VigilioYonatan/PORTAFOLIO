import {
	seedLocalhostTenant,
	setupTestDb,
} from "@infrastructure/config/server/setup-test-db";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../../app.module";

describe("Conversation - GET /conversation (E2E)", () => {
	let app: INestApplication;
	let tenantId: number;

	beforeAll(async () => {
		const db = await setupTestDb();
		tenantId = await seedLocalhostTenant(db);

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();

		// Use standard config
		const { configureApp } = await import(
			"@infrastructure/config/server/app.config"
		);
		configureApp(app);

		// Mock Auth Middleware
		// Provide a valid tenant context
		app.use((req: any, _res: any, next: any) => {
			req.isAuthenticated = () => true;
			req.user = {
				id: 1,
				role_id: 1,
				tenant_id: tenantId,
				email: "test@example.com",
			};
			req.locals = {
				tenant: { id: tenantId },
				user: req.user,
			};
			next();
		});

		await app.init();
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});

	describe("GET /api/v1/conversation (Index)", () => {
		it("should return paginated conversation", async () => {
			// Create a conversation first
			await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send({
					visitor_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
					title: "Test Conversation 1",
				});

			// Create another one
			await request(app.getHttpServer())
				.post("/api/v1/chat/conversations")
				.set("Host", "localhost")
				.send({
					visitor_id: "f47ac10b-58cc-4372-a567-0e02b2c3d488",
					title: "Test Conversation 2",
				});

			const response = await request(app.getHttpServer())
				.get("/api/v1/chat/conversations")
				.set("Host", "localhost"); // Required for tenant resolution if middleware uses it

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.count).toBeGreaterThanOrEqual(2);
			expect(Array.isArray(response.body.results)).toBe(true);

			// Verify structure matches createPaginatorSchema
			expect(response.body).toHaveProperty("next");
			expect(response.body).toHaveProperty("previous");
			expect(response.body.results[0]).toHaveProperty("id");
			expect(response.body.results[0]).toHaveProperty("title");
		});
	});
});
