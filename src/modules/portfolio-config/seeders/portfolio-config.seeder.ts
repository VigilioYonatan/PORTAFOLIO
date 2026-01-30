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
			biography: `Soy Yonatan Vigilio Lavado, desarrollador de software con más de 6 años de experiencia y especialista en la implementación de inteligencia artificial desde 2020. Me especializo en el diseño de software robusto y mantenible bajo principios de arquitectura limpia, asegurando escalabilidad, rendimiento y calidad de código a largo plazo. He liderado proyectos escalables y el desarrollo de bibliotecas open source, dominando un amplio stack de tecnologías modernas. 

Además de mi pasión por el aprendizaje continuo y la innovación, soy un entusiasta de la música electrónica, específicamente del Drum and Bass, género que exploro a través de la producción musical en mi tiempo libre, lo que me ayuda a mantener un equilibrio entre la lógica del código y la creatividad sonora.`,
			email: "yonatanvigiliolavado09@gmail.com",
			phone: "+51 959 884 398",
			address: "Lima, Peru",
			social_links: {
				linkedin: "https://linkedin.com/in/yonatanvigilio",
				github: "https://github.com/yonatanvigilio",
				twitter: null,
				youtube: null,
				whatsapp: "https://wa.me/51959884398",
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
