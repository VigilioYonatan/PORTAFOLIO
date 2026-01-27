import type { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../../app.module";
import {
	seedLocalhostTenant,
	setupTestDb,
} from "../../../infrastructure/config/server/setup-test-db";

describe("ProjectModule (e2e)", () => {
	let app: INestApplication;
	let adminToken: string;
	let tenantId: number;
	let projectId: number;
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
	});

	describe("POST /api/v1/project", () => {
		it("should create a new project (Admin)", async () => {
			const payload = {
				title: "E2E Test Project",
				slug: "e2e-test-project",
				description: "A project created by E2E tests",
				content: "# Project Content\n\nThis is a markdown content.",
				impact_summary: "High Impact",
				website_url: "https://example.com",
				repo_url: "https://github.com/example/repo",
				start_date: new Date().toISOString(),
				end_date: null,
				status: "in_dev",
				is_visible: true,
				is_featured: false,
				sort_order: 1,
				images: null,
				seo: null,
				techeables: [],
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/project")
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);

			if (response.status !== 201) {
				console.error(
					"❌ POST /api/v1/project failed:",
					JSON.stringify(response.body, null, 2),
				);
			}

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.project).toBeDefined();
			expect(response.body.project.slug).toBe("e2e-test-project");
			projectId = response.body.project.id;
		});
	});

	describe("GET /api/v1/project", () => {
		it("should list projects (Public)", async () => {
			const response = await request(app.getHttpServer())
				.get("/api/v1/project")
				.set("host", "localhost")
				.set("Accept", "application/json");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.results.length).toBeGreaterThan(0);
		});
	});

	describe("PUT /api/v1/project/:id", () => {
		it("should update a project (Admin)", async () => {
			const payload = {
				title: "Updated Project Title",
				slug: "e2e-test-project", // Keeping same or changing?
				description: "Updated Description",
				content: "# Updated Content",
				impact_summary: "Updated Impact",
				website_url: "https://example.com/updated",
				repo_url: "https://github.com/example/repo-updated",
				start_date: new Date().toISOString(),
				end_date: null,
				status: "live",
				is_visible: true,
				is_featured: true,
				sort_order: 2,
				images: null,
				seo: null,
				techeables: [],
			};

			const response = await request(app.getHttpServer())
				.put(`/api/v1/project/${projectId}`)
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.project.title).toBe(payload.title);
		});
	});

	describe("DELETE /api/v1/project/:id", () => {
		it("should delete a project (Admin)", async () => {
			const response = await request(app.getHttpServer())
				.delete(`/api/v1/project/${projectId}`)
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});
});
