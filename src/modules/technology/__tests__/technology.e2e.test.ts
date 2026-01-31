import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { userEntity } from "@modules/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import request from "supertest";
import { TechnologyFactory } from "./technology.factory";

describe("Technology Module (E2E)", () => {
	const e2e = new E2EApp();
	let adminAccessToken: string;

	beforeAll(async () => {
		await e2e.init();
		const db = e2e.db;
		const jwtService = e2e.moduleRef.get(JwtService);

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
	});

	afterAll(async () => {
		await e2e.close();
	});

	describe("POST /technologies", () => {
		it("should create a technology (Admin)", async () => {
			const dto = TechnologyFactory.createStoreDto({ category: "BACKEND" });

			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/technology")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(dto);

			expect(response.status).toBe(201);
			expect(response.body.technology.name).toBe(dto.name);
		});
	});

	describe("GET /technologies", () => {
		it("should list technologies (Public)", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/technology")
				.set("Host", "localhost");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.results)).toBe(true);
		});
	});

	describe("PATCH /technologies/:id", () => {
		it("should update a technology", async () => {
			const createDto = TechnologyFactory.createStoreDto();
			const createRes = await request(e2e.app.getHttpServer())
				.post("/api/v1/technology")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const id = createRes.body.technology.id;
			const updateDto = TechnologyFactory.createStoreDto({
				name: "Updated Name",
			});

			const response = await request(e2e.app.getHttpServer())
				.patch(`/api/v1/technology/${id}`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(updateDto);

			expect(response.status).toBe(200);
			expect(response.body.technology.name).toBe("Updated Name");
		});
	});

	describe("DELETE /technologies/:id", () => {
		it("should delete a technology", async () => {
			const createDto = TechnologyFactory.createStoreDto();
			const createRes = await request(e2e.app.getHttpServer())
				.post("/api/v1/technology")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const id = createRes.body.technology.id;

			const response = await request(e2e.app.getHttpServer())
				.delete(`/api/v1/technology/${id}`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});
});
