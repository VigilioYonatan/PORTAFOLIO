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
			name: "Yonatan Vigilio Lavado",
			profile_title: "Ingeniero de Software con Inteligencia Artificial",
			biography: `Soy un ingeniero de software con Inteligencia Artificial especializado en el desarrollo de aplicaciones web y móviles, con más de 6 años de experiencia. A lo largo de mi carrera, he trabajado en diversos proyectos, desde sitios web interactivos hasta aplicaciones móviles complejas implementando inteligencia Artifical.

Tengo un dominio sólido de frameworks modernos como React y Vue.js para el frontend, y en el backend he utilizado Express.js, Nest.js y Laravel para construir aplicaciones escalables, seguras y eficientes. Además, cuento con experiencia en integración y entrega continua (CI/CD) utilizando Docker, optimizando así los flujos de desarrollo y despliegue.

Aporto mi conocimiento, creatividad y compromiso a cada proyecto, con el objetivo de desarrollar y automatizar soluciones tecnológicas innovadoras que realmente marquen la diferencia.`,
			email: "yonatanvigiliolavado09@gmail.com",
			phone: "+51 959 884 398",
			address: "Lima, Peru",
			social_links: {
				linkedin: "https://linkedin.com/in/yonatanvigilio",
				github: "https://github.com/yonatanvigilio",
				twitter: null,
				youtube: null,
				portfolio: "https://yonatanvigilio.com",
			},
			logo: null,
			color_primary: "#3B82F6",
			color_secondary: "#10B981",
			default_language: "ES",
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
