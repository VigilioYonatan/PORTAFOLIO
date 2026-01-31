import { E2EApp } from "@infrastructure/config/server/e2e-app";
import { sql } from "drizzle-orm";
import request from "supertest";

describe("Portfolio Config E2E Tests", () => {
	const e2e = new E2EApp();

	beforeAll(async () => {
		await e2e.init();
		const db = e2e.db;

		// Seed portfolio config
		await db.execute(sql`
			INSERT INTO portfolio_config (
				tenant_id, name, profile_title, biography, email, phone, address,
				social_links, logo, color_primary, color_secondary,
				default_language, time_zone, created_at, updated_at
			) VALUES (
				${e2e.tenantId}, 
				'Test User', 
				'Senior Engineer', 
				'# About Me\n\nTest biography.',
				'test@portfolio.dev',
				'+1 555 123 4567',
				'Test City, USA',
				'{"linkedin": "https://linkedin.com/in/test", "github": "https://github.com/test", "twitter": null, "youtube": null, "whatsapp": null}',
				NULL,
				'#3B82F6',
				'#10B981',
				'EN',
				'America/Lima',
				NOW(),
				NOW()
			) ON CONFLICT (tenant_id) DO NOTHING
		`);

		// Seed work experience
		await db.execute(sql`
			INSERT INTO work_experiences (
				tenant_id, company, position, description, start_date, is_current, is_visible, sort_order
			) VALUES (
				${e2e.tenantId}, 'Tech Corp', 'Developer', 'Coding stuff', '2020-01-01', true, true, 1
			)
		`);

		// Seed project
		await db.execute(sql`
			INSERT INTO projects (
				tenant_id, title, slug, description, content, impact_summary, is_visible, sort_order, start_date
			) VALUES (
				${e2e.tenantId}, 'Cool Project', 'cool-project', 'Cool description', 'Cool content', 'High impact', true, 1, '2023-01-01'
			)
		`);
	});

	afterAll(async () => {
		await e2e.close();
	});

	describe("GET /config", () => {
		it("should return portfolio configuration (Public)", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/config")
				.set("Host", "localhost");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.config).toBeDefined();
			expect(response.body.config.name).toBe("Test User");
			expect(response.body.config.profile_title).toBe("Senior Engineer");
			expect(response.body.config.email).toBe("test@portfolio.dev");
			expect(response.body.config.color_primary).toBe("#3B82F6");
			expect(response.body.config.color_secondary).toBe("#10B981");
			expect(response.body.config.default_language).toBe("EN");
		});

		it("should return social links as JSONB object", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/config")
				.set("Host", "localhost");

			expect(response.status).toBe(200);
			expect(response.body.config.social_links).toBeDefined();
			expect(response.body.config.social_links.linkedin).toBe(
				"https://linkedin.com/in/test",
			);
			expect(response.body.config.social_links.github).toBe(
				"https://github.com/test",
			);
		});
	});

	describe("PUT /config", () => {
		it("should update portfolio configuration (Admin)", async () => {
			const updateData = {
				name: "Updated User",
				profile_title: "Lead Engineer",
				biography: "# Updated Bio\n\nThis is an updated biography.",
				email: "updated@portfolio.dev",
				phone: "+1 555 987 6543",
				address: "Updated City, USA",
				social_links: {
					linkedin: "https://linkedin.com/in/updated",
					github: "https://github.com/updated",
					twitter: "https://twitter.com/updated",
					youtube: null,
					whatsapp: null,
				},
				logo: null,
				color_primary: "#EF4444",
				color_secondary: "#8B5CF6",
				default_language: "ES" as const,
				time_zone: "America/Bogota" as const,
			};

			const response = await request(e2e.app.getHttpServer())
				.put("/api/v1/config")
				.set("Host", "localhost")
				.set("x-mock-role", "admin")
				.send(updateData);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.config).toBeDefined();
			expect(response.body.config.name).toBe("Updated User");
			expect(response.body.config.profile_title).toBe("Lead Engineer");
			expect(response.body.config.email).toBe("updated@portfolio.dev");
			expect(response.body.config.color_primary).toBe("#EF4444");
			expect(response.body.config.default_language).toBe("ES");
		});

		it("should reject non-admin users", async () => {
			const updateData = {
				name: "Hacker",
				profile_title: "Hacker",
				biography: "Hacked!",
				email: "hacker@evil.com",
				phone: null,
				address: null,
				social_links: null,
				logo: null,
				color_primary: "#000000",
				color_secondary: "#000000",
				default_language: "EN" as const,
				time_zone: null,
			};

			const response = await request(e2e.app.getHttpServer())
				.put("/api/v1/config")
				.set("Host", "localhost")
				.set("x-mock-role", "user") // Non-admin
				.send(updateData);

			// Should be forbidden for non-admin
			expect(response.status).toBe(403);
		});
	});

	describe("GET /config/cv/download", () => {
		it("should generate and download CV file (Public)", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/config/cv/download")
				.set("Host", "localhost");

			expect(response.status).toBe(200);
			expect(response.headers["content-type"]).toContain("text/plain");
			expect(response.headers["content-disposition"]).toContain("attachment");
			expect(response.headers["content-disposition"]).toContain("cv-");

			// Verify CV content contains portfolio data and extra sections
			const cvContent = response.text.toLowerCase();
			// Use more flexible check if data might be seeded or updated
			expect(cvContent).toMatch(/test user|updated user/);
			expect(cvContent).toMatch(/senior engineer|lead engineer/);
			expect(cvContent).toContain("[ contacto ]");
			expect(cvContent).toContain("[ perfil profesional ]");
			expect(cvContent).toContain("[ experiencia laboral ]");
			expect(cvContent).toContain("tech corp");
			expect(cvContent).toContain("[ proyectos destacados ]");
			expect(cvContent).toContain("cool project");
		});

		it("should include portfolio info in CV content", async () => {
			const response = await request(e2e.app.getHttpServer())
				.get("/api/v1/config/cv/download")
				.set("Host", "localhost");

			expect(response.status).toBe(200);
			expect(response.text.toLowerCase()).toContain("email:");
		});
	});
});
