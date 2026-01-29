/** biome-ignore-all lint/suspicious/noConsole: <explanation> */

import { configureApp } from "@infrastructure/config/server/app.config";
import type { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import { sql } from "drizzle-orm";
import request from "supertest";
import { AppModule } from "../../../app.module";
import {
	seedLocalhostTenant,
	setupTestDb,
} from "../../../infrastructure/config/server/setup-test-db";

describe("WorkMilestoneModule (e2e)", () => {
	let app: INestApplication;
	let adminToken: string;
	let tenantId: number;
	let experienceId: number;
	let milestoneId: number;
	let db: any;
	let jwtService: JwtService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		db = await setupTestDb();

		app = moduleFixture.createNestApplication();

		configureApp(app);
		jwtService = moduleFixture.get(JwtService);

		await app.init();

		// 1. Setup Tenant (localhost seeded by setupTestDb)
		tenantId = await seedLocalhostTenant(db);

		// 2. Generate Admin Token (admin@localhost.com seeded by setupTestDb)
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

		const expResult = await db.execute(sql`
      INSERT INTO work_experiences (company, position, description, location, start_date, tenant_id, created_at, updated_at)
      VALUES ('Test Co', 'Developer', 'Test Desc', 'Test Loc', NOW(), ${tenantId}, NOW(), NOW())
      RETURNING id
    `);
		experienceId = expResult.rows[0].id;
		console.log("DEBUG: experienceId =", experienceId);
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});

	describe("POST /work-milestone", () => {
		it("should create a new milestone (Admin)", async () => {
			const payload = {
				title: "Launched MVP",
				description: "Successfully launched the first version",
				milestone_date: new Date().toISOString(),
				sort_order: 1,
				work_experience_id: experienceId,
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/work-milestone")
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);

			if (response.status !== 201) {
				console.error(
					"❌ POST /work-milestone failed:",
					JSON.stringify(response.body, null, 2),
				);
			}

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.milestone).toBeDefined();
			milestoneId = response.body.milestone.id;
		});
	});

	describe("GET /work-milestone", () => {
		it("should list milestones for an experience (Public)", async () => {
			const response = await request(app.getHttpServer())
				.get("/api/v1/work-milestone")
				.query({ work_experience_id: experienceId })
				.set("host", "localhost")
				.set("Accept", "application/json");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.results.length).toBeGreaterThan(0);
			expect(response.body.results[0].work_experience_id).toBe(experienceId);
		});
	});

	describe("PUT /work-milestone/:id", () => {
		it("should update a milestone (Admin)", async () => {
			const payload = {
				title: "Updated Milestone",
				description: "Updated Description",
				milestone_date: new Date().toISOString(),
				sort_order: 2,
				work_experience_id: experienceId,
			};

			const response = await request(app.getHttpServer())
				.put(`/api/v1/work-milestone/${milestoneId}`)
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);

			if (response.status !== 200) {
				console.error(
					"❌ PUT /work-milestone/:id failed:",
					JSON.stringify(response.body, null, 2),
				);
			}
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.milestone.title).toBe(payload.title);
		});

		it("should return 404 for non-existent milestone", async () => {
			const payload = {
				title: "Updated Milestone",
				description: "Updated Description",
				milestone_date: new Date().toISOString(),
				sort_order: 2,
				work_experience_id: experienceId,
			};

			await request(app.getHttpServer())
				.put("/api/v1/work-milestone/999999")
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload)
				.expect(404);
		});
	});

	describe("DELETE /work-milestone/:id", () => {
		it("should delete a milestone (Admin)", async () => {
			const response = await request(app.getHttpServer())
				.delete(`/api/v1/work-milestone/${milestoneId}`)
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`);

			if (response.status !== 200) {
				console.error(
					"❌ DELETE /work-milestone/:id failed:",
					JSON.stringify(response.body, null, 2),
				);
			}
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should return 404 for non-existent milestone", async () => {
			await request(app.getHttpServer())
				.delete("/api/v1/work-milestone/999999")
				.set("host", "localhost")
				.set("Accept", "application/json")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(404);
		});
	});
});
