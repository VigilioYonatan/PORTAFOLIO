import { faker } from "@faker-js/faker";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid/date.utils";
import { workExperienceEntity } from "@modules/work-experience/entities/work-experience.entity";
import { Inject, Injectable } from "@nestjs/common";
import { eq, type InferInsertModel } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { workMilestoneEntity } from "../entities/work-milestone.entity";

@Injectable()
export class WorkMilestoneSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number) {
		// 1. Get existing experiences
		const experiences = await this.db.query.workExperienceEntity.findMany({
			where: eq(workExperienceEntity.tenant_id, tenant_id),
		});

		if (experiences.length === 0) {
			return [];
		}

		const milestonesSeed: InferInsertModel<typeof workMilestoneEntity>[] = [];

		// Create 1-3 milestones per experience
		for (const exp of experiences) {
			const count = faker.number.int({ min: 1, max: 3 });
			for (let i = 0; i < count; i++) {
				milestonesSeed.push({
					title: faker.person.jobTitle(), // Using jobTitle as milestone title (e.g. Promoted to X)
					description: faker.lorem.sentence(),
					icon: null,
					milestone_date: faker.date.between({
						from: new Date(exp.start_date),
						to: exp.end_date ? new Date(exp.end_date) : new Date(),
					}),
					sort_order: i,
					work_experience_id: exp.id,
					tenant_id: tenant_id,
					created_at: now().toDate(),
					updated_at: now().toDate(),
				});
			}
		}

		if (milestonesSeed.length > 0) {
			return await this.db
				.insert(workMilestoneEntity)
				.values(milestonesSeed)
				.returning();
		}
		return [];
	}
}
