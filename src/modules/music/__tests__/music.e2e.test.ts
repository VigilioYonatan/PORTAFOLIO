import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { userEntity } from "@modules/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import request from "supertest";
import { MusicFactory } from "./music.factory";

describe("Music Module (E2E)", () => {
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

	describe("POST /music", () => {
		it("should upload a new music track (Admin)", async () => {
			const dto = MusicFactory.createDto();

			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/music")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(dto);

			expect(response.status).toBe(201);
			expect(response.body.music.title).toBe(dto.title);
		});
	});

	describe("GET /music", () => {
		it("should list music tracks (Public)", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/music")
				.set("Host", "localhost");

			expect(response.status).toBe(200);
			expect(response.body.results).toBeInstanceOf(Array);
		});
	});

	describe("PUT /music/:id", () => {
		it("should update a music track", async () => {
			const createDto = MusicFactory.createDto();
			const createResponse = await request(e2e.app.getHttpServer())
				.post("/api/v1/music")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const musicId = createResponse.body.music.id;
			const updateDto = MusicFactory.createDto({ title: "Updated Title" });

			const response = await request(e2e.app.getHttpServer())
				.put(`/api/v1/music/${musicId}`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(updateDto);

			expect(response.status).toBe(200);
			expect(response.body.music.title).toBe("Updated Title");
		});
	});

	describe("DELETE /music/:id", () => {
		it("should delete a music track", async () => {
			const createDto = MusicFactory.createDto();
			const createResponse = await request(e2e.app.getHttpServer())
				.post("/api/v1/music")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const musicId = createResponse.body.music.id;

			const response = await request(e2e.app.getHttpServer())
				.delete(`/api/v1/music/${musicId}`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});
});
