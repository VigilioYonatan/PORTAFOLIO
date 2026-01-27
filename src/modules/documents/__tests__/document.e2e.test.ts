import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { userEntity } from "@modules/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import request from "supertest";
import { DocumentFactory } from "./document.factory";

describe("Document Module (E2E)", () => {
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

	describe("POST /documents", () => {
		it("should upload a new document (Admin)", async () => {
			const dto = DocumentFactory.createDto();

			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/document")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(dto);

			expect(response.status).toBe(201);
			expect(response.body.document.title).toBe(dto.title);
		});

		it("should upload a document with null metadata", async () => {
			const dto = DocumentFactory.createDtoWithNullMetadata();

			const response = await request(e2e.app.getHttpServer())
				.post("/api/v1/document")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(dto);

			expect(response.status).toBe(201);
			expect(response.body.document.metadata).toBeNull();
		});
	});

	describe("GET /documents", () => {
		it("should list documents (Admin)", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/document")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.results)).toBe(true);
		});
	});

	describe("POST /documents/:id/process", () => {
		it("should process a document for RAG", async () => {
			const createDto = DocumentFactory.createDto();
			const createResponse = await request(e2e.app.getHttpServer())
				.post("/api/v1/document")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const documentId = createResponse.body.document.id;

			const response = await request(e2e.app.getHttpServer())
				.post(`/api/v1/document/${documentId}/process`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.document.status).toBe("READY");
		});
	});

	describe("GET /documents/:id", () => {
		it("should get document details", async () => {
			const createDto = DocumentFactory.createDto();
			const createResponse = await request(e2e.app.getHttpServer())
				.post("/api/v1/document")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const documentId = createResponse.body.document.id;

			const response = await request(e2e.app.getHttpServer())
				.get(`/api/v1/document/${documentId}`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.document.id).toBe(documentId);
		});
	});

	describe("PUT /documents/:id", () => {
		it("should update a document", async () => {
			const createDto = DocumentFactory.createDto();
			const createResponse = await request(e2e.app.getHttpServer())
				.post("/api/v1/document")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const documentId = createResponse.body.document.id;
			const updateDto = DocumentFactory.createDto({ title: "Updated Title" });

			const response = await request(e2e.app.getHttpServer())
				.put(`/api/v1/document/${documentId}`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(updateDto);

			expect(response.status).toBe(200);
			expect(response.body.document.title).toBe("Updated Title");
		});
	});

	describe("DELETE /documents/:id", () => {
		it("should delete a document", async () => {
			const createDto = DocumentFactory.createDto();
			const createResponse = await request(e2e.app.getHttpServer())
				.post("/api/v1/document")
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin")
				.send(createDto);

			const documentId = createResponse.body.document.id;

			const response = await request(e2e.app.getHttpServer())
				.delete(`/api/v1/document/${documentId}`)
				.set("Host", "localhost")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.set("x-mock-role", "admin");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});
});
