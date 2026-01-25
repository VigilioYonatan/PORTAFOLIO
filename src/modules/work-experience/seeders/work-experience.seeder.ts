import { faker } from "@faker-js/faker";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { Inject, Injectable } from "@nestjs/common";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { type InferInsertModel } from "drizzle-orm";
import { workExperienceEntity } from "../entities/work-experience.entity";

@Injectable()
export class WorkExperienceSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenantId: number) {
		const experiencesSeed: InferInsertModel<typeof workExperienceEntity>[] =
			Array.from({
				length: 5,
			}).map(() => ({
				tenant_id: tenantId,
				company: faker.company.name(),
				position: faker.person.jobTitle(),
				description: faker.lorem.paragraph(),
				start_date: faker.date.past(),
				end_date: faker.datatype.boolean() ? faker.date.recent() : null,
				is_current: false,
				location: faker.location.city(),
				location_type: faker.helpers.arrayElement([
					"REMOTE",
					"HYBRID",
					"ONSITE",
				]),
				website_url: faker.internet.url(),
				skills: faker.helpers.arrayElements(
					["React", "NestJS", "TypeScript", "Drizzle", "PostgreSQL"],
					{ min: 2, max: 5 },
				),
				sort_order: faker.number.int({ min: 1, max: 100 }),
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			}));

		return await this.db
			.insert(workExperienceEntity)
			.values(experiencesSeed)
			.returning();
	}
}
