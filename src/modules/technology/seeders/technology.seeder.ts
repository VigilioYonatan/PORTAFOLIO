import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { technologyEntity } from "../entities/technology.entity";
import { type TechnologySchema } from "../schemas/technology.schema";

@Injectable()
export class TechnologySeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number) {
		// Curated technologies from image and user requests
		const initialTechs: Omit<TechnologySchema, "id">[] = (
			[
				// LANGUAGES
				{ name: "JavaScript", category: "LANGUAGE" },
				{ name: "TypeScript", category: "LANGUAGE" },
				{ name: "PHP", category: "LANGUAGE" },
				{ name: "Python", category: "LANGUAGE" },

				// FRONTEND
				{ name: "HTML5", category: "FRONTEND" },
				{ name: "CSS3", category: "FRONTEND" },
				{ name: "Sass", category: "FRONTEND" },
				{ name: "Tailwind CSS", category: "FRONTEND" },
				{ name: "Vite", category: "FRONTEND" },
				{ name: "Astro", category: "FRONTEND" },
				{ name: "Preact", category: "FRONTEND" },
				{ name: "React", category: "FRONTEND" },
				{ name: "React Native", category: "MOBILE" },
				{ name: "Expo", category: "MOBILE" },
				{ name: "Google Play", category: "MOBILE" },
				{ name: "App Store", category: "MOBILE" },
				{ name: "Vue", category: "FRONTEND" },
				{ name: "Angular", category: "FRONTEND" },
				{ name: "Alpine.js", category: "FRONTEND" },
				{ name: "Svelte", category: "FRONTEND" },
				{ name: "i18next", category: "FRONTEND" },
				{ name: "Figma", category: "FRONTEND" },
				{ name: "Stitch", category: "FRONTEND" },
				{ name: "NPM", category: "FRONTEND" },

				// BACKEND
				{ name: "NestJS", category: "BACKEND" },
				{ name: "Next.js", category: "BACKEND" },
				{ name: "Laravel", category: "BACKEND" },
				{ name: "Hono", category: "BACKEND" },
				{ name: "Node.js", category: "BACKEND" },
				{ name: "Bun", category: "BACKEND" },
				{ name: "PostgreSQL", category: "DATABASE" },
				{ name: "MySQL", category: "DATABASE" },
				{ name: "MongoDB", category: "DATABASE" },
				{ name: "Playwright", category: "BACKEND" },
				{ name: "Composer", category: "BACKEND" },
				{ name: "Puppeteer", category: "BACKEND" },
				{ name: "Socket.io", category: "BACKEND" },
				{ name: "Paypal SDK", category: "BACKEND" },
				// DEVOPS
				{ name: "Linux", category: "DEVOPS" },
				{ name: "Docker", category: "DEVOPS" },
				{ name: "AWS", category: "DEVOPS" },
				{ name: "Kubernetes", category: "DEVOPS" },
				{ name: "Podman", category: "DEVOPS" },
				{ name: "GitHub", category: "DEVOPS" },
				{ name: "GitHub Actions", category: "DEVOPS" },
				{ name: "Apache", category: "DEVOPS" },
				{ name: "Nginx", category: "DEVOPS" },
				{ name: "Vercel", category: "DEVOPS" },
				{ name: "NATS", category: "DEVOPS" },
				{ name: "Redis", category: "DATABASE" },
				{ name: "Terraform", category: "DEVOPS" },

				// AI
				{ name: "Groq", category: "AI" },
				{ name: "Mistral", category: "AI" },
				{ name: "Ollama", category: "AI" },
				{ name: "LangChain", category: "AI" },
				{ name: "n8n", category: "AI" },
				{ name: "Hugging Face", category: "AI" },
				{ name: "WhatsApp Web.js", category: "AI" },
				{ name: "ChatGPT", category: "AI" },
				{ name: "DeepSeek", category: "AI" },
				{ name: "v0", category: "AI" },
				{ name: "Antigravity", category: "AI" },
				{ name: "Claude", category: "AI" },
			] as const
		).map((tech) => ({
			...tech,
			tenant_id,
			icon: null,
			created_at: now().toDate(),
			updated_at: now().toDate(),
		}));

		// Batch insert for performance
		for (const tech of initialTechs) {
			const exists = await this.db.query.technologyEntity.findFirst({
				where: and(
					eq(technologyEntity.tenant_id, tenant_id),
					eq(technologyEntity.name, tech.name),
				),
			});

			if (!exists) {
				await this.db.insert(technologyEntity).values(tech).returning();
			}
		}
	}
}
