import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { portfolioConfigEntity } from "@modules/portfolio-config/entities/portfolio-config.entity";
import type { PortfolioConfigSchema } from "@modules/portfolio-config/schemas/portfolio-config.schema";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class PortfolioConfigSeeder {
	private readonly logger = new Logger(PortfolioConfigSeeder.name);

	/**
	 * Datos de ejemplo para el portfolio config
	 */
	private readonly data: Omit<PortfolioConfigSchema, "id" | "tenant_id">[] = [
		{
			name: "John Doe",
			profile_title: "Senior Full-Stack Engineer",
			biography: `# About Me

I'm a passionate **Senior Full-Stack Engineer** with 10+ years of experience building scalable web applications.

## Expertise
- Frontend: React, Vue, Angular, TypeScript
- Backend: Node.js, NestJS, Python, Go
- Database: PostgreSQL, MongoDB, Redis
- DevOps: Docker, Kubernetes, AWS

## Philosophy
I believe in writing clean, maintainable code that solves real problems. Every line of code should have a purpose.`,
			email: "john.doe@portfolio.dev",
			phone: "+1 555 123 4567",
			address: "San Francisco, CA, USA",
			social_links: {
				linkedin: "https://linkedin.com/in/johndoe",
				github: "https://github.com/johndoe",
				twitter: "https://twitter.com/johndoe",
				youtube: null,
				portfolio: null,
			},
			logo: null,
			color_primary: "#3B82F6",
			color_secondary: "#10B981",
			default_language: "EN",
			time_zone: "America/Lima",
			created_at: now().toDate(),
			updated_at: now().toDate(),
		},
	];

	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	/**
	 * Ejecuta el seeder
	 * Crea la configuración inicial del portfolio para un tenant
	 */
	async run(tenant_id: number): Promise<PortfolioConfigSchema[]> {
		this.logger.log({ tenant_id }, "Seeding portfolio config...");

		const portfolioConfigSeed = this.data.map((config) => ({
			...config,
			tenant_id,
			created_at: now().toDate(),
			updated_at: now().toDate(),
		}));

		const result = await this.db
			.insert(portfolioConfigEntity)
			.values(portfolioConfigSeed)
			.returning();

		this.logger.log(
			{ tenant_id },
			`Created ${result.length} portfolio config record(s)`,
		);
		return result;
	}
}
