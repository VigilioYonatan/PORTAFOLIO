import type { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../../app.module";
import {
	seedLocalhostTenant,
	setupTestDb,
} from "../../../infrastructure/config/server/setup-test-db";

describe("BlogPostModule (e2e)", () => {
	let app: INestApplication;
	let adminToken: string;
	let tenantId: number;
	let postId: number;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let db: any;
	let jwtService: JwtService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		db = await setupTestDb();
		app = moduleFixture.createNestApplication();
		const { configureApp } = await import(
			"@infrastructure/config/server/app.config"
		);
		configureApp(app);
		jwtService = moduleFixture.get(JwtService);

		await app.init();

		tenantId = await seedLocalhostTenant(db);

		const adminUser = {
			id: 1,
			email: "admin@localhost.com",
			role_id: 1,
			tenant_id: tenantId,
			security_stamp: "550e8400-e29b-41d4-a716-446655440000",
		};

		adminToken = jwtService.sign({
			sub: adminUser.id,
			email: adminUser.email,
			role_id: adminUser.role_id,
			tenant_id: adminUser.tenant_id,
			security_stamp: adminUser.security_stamp,
		});
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
		const { teardownTestDb } = await import(
			"../../../infrastructure/config/server/setup-test-db"
		);
		await teardownTestDb();
	});

	describe("POST /api/v1/blog-post", () => {
		it("should create a new blog post (Admin)", async () => {
			const payload = {
				title: "E2E Blog Post",
				slug: "e2e-blog-post",
				content: "# Blog Content",
				extract: "E2E Extract",
				is_published: true,
				reading_time_minutes: 5,
				cover: null,
				seo: null,
				published_at: null,
				category_id: null,
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/blog-post")
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);

			if (response.status !== 201) {
			}

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.post).toBeDefined();
			expect(response.body.post.slug).toBe("e2e-blog-post");
			postId = response.body.post.id;
		});
	});

	describe("GET /api/v1/blog-post", () => {
		it("should list blog posts (Public)", async () => {
			const response = await request(app.getHttpServer())
				.get("/api/v1/blog-post")
				.set("host", "localhost")
				.set("Accept", "application/json");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.results.length).toBeGreaterThan(0);
		});
	});

	describe("PUT /api/v1/blog-post/:id", () => {
		it("should update a blog post (Admin)", async () => {
			const payload = {
				title: "Updated Blog Post Title",
				slug: "updated-blog-post",
				content: "Updated content",
				extract: "Updated Extract",
				is_published: true,
				reading_time_minutes: 10,
				cover: null,
				seo: null,
				published_at: null,
				category_id: null,
			};

			const response = await request(app.getHttpServer())
				.put(`/api/v1/blog-post/${postId}`)
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.post.title).toBe(payload.title);
		});
	});

	describe("DELETE /api/v1/blog-post/:id", () => {
		it("should delete a blog post (Admin)", async () => {
			const response = await request(app.getHttpServer())
				.delete(`/api/v1/blog-post/${postId}`)
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});
});
