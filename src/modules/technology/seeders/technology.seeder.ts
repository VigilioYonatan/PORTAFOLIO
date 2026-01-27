import { faker } from "@faker-js/faker";
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
		const categories: TechnologySchema["category"][] = [
			"FRONTEND",
			"BACKEND",
			"DATABASE",
			"DEVOPS",
			"LANGUAGE",
		];

		const technologies: Omit<TechnologySchema, "id">[] = Array.from({
			length: 1000,
		}).map((_, i) => ({
			name: `${faker.hacker.adjective()} ${faker.hacker.noun()} ${i}`,
			category: faker.helpers.arrayElement(categories),
			icon: [],
			tenant_id,
			created_at: now().toDate(),
			updated_at: now().toDate(),
		}));

		// Specific known technologies for the initial set
		const initialTechs: Omit<TechnologySchema, "id">[] = [
			{
				name: "React",
				category: "FRONTEND",
				tenant_id,
				icon: [],
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				name: "NestJS",
				category: "BACKEND",
				tenant_id,
				icon: [],
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				name: "PostgreSQL",
				category: "DATABASE",
				tenant_id,
				icon: [],
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				name: "Docker",
				category: "DEVOPS",
				tenant_id,
				icon: [],
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				name: "TypeScript",
				category: "LANGUAGE",
				tenant_id,
				icon: [],
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
		];

		const allTechs = [...initialTechs, ...technologies];

		// Batch insert for performance
		for (const tech of allTechs) {
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
