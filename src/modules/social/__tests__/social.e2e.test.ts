import { E2EApp } from "@infrastructure/config/server/e2e-app";
import request from "supertest";

describe("Social Module (E2E)", () => {
	const e2e = new E2EApp();
	let commentId: number;

	beforeAll(async () => {
		await e2e.init();
	});

	afterAll(async () => {
		await e2e.close();
	});

	describe("Comments", () => {
		it("should create, list, and filter social comments", async () => {
			const payload = {
				name: "John",
				surname: "Doe",
				content: "Consolidated test!",
				commentable_id: 1,
				commentable_type: "BLOG_POST",
				visitor_id: "00000000-0000-0000-0000-000000000000",
				ip_address: "127.0.0.1",
			};

			// 1. Create
			const createRes = await request(e2e.app.getHttpServer())
				.post("/api/v1/comments")
				.set("Host", "localhost")
				.send(payload);

			expect(createRes.status).toBe(201);
			commentId = createRes.body.comment.id;

			// 2. List
			const indexRes = await request(e2e.app.getHttpServer())
				.get("/api/v1/comments")
				.set("Host", "localhost");

			expect(indexRes.status).toBe(200);
			expect(Array.isArray(indexRes.body.results)).toBe(true);

			// 3. Filter
			const filterRes = await request(e2e.app.getHttpServer())
				.get("/api/v1/comments")
				.set("Host", "localhost")
				.query({ commentable_id: 1, commentable_type: "BLOG_POST" });

			expect(filterRes.status).toBe(200);
			expect(filterRes.body.results.length).toBeGreaterThanOrEqual(1);
		});

		it("should handle replies and updates (Admin)", async () => {
			// 1. Reply
			await request(e2e.app.getHttpServer())
				.post(`/api/v1/comments/${commentId}/reply`)
				.set("Host", "localhost")
				.set("x-mock-role", "admin")
				.send({ content: "Official consolidated reply" })
				.expect(200);

			// 2. Update status
			await request(e2e.app.getHttpServer())
				.patch(`/api/v1/comments/${commentId}`)
				.set("Host", "localhost")
				.set("x-mock-role", "admin")
				.send({ is_visible: false })
				.expect(200);
		});
	});

	describe("Reactions", () => {
		it("should toggle reactions", async () => {
			const reactionPayload = {
				type: "LIKE",
				reactable_id: 1,
				reactable_type: "BLOG_POST",
				visitor_id: "00000000-0000-0000-0000-000000000000",
			};

			const res = await request(e2e.app.getHttpServer())
				.post("/api/v1/social/reactions")
				.set("Host", "localhost")
				.send(reactionPayload);

			expect(res.status).toBe(200);
			expect(res.body.action).toBe("ADDED");
			expect(res.body.reaction).toBeDefined();
		});
	});
});
