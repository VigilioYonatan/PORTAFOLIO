import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { Inject, Injectable } from "@nestjs/common";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { blogCategoryEntity } from "../entities/blog-category.entity";
import type { BlogCategorySchema } from "../schemas/blog-category.schema";

@Injectable()
export class BlogCategorySeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenantId: number) {
		const {faker} = await import("@faker-js/faker");
		const categoriesSeed: Omit<BlogCategorySchema, "id">[] = Array.from({
			length: 8,
		}).map(() => {
			const name = faker.lorem.words(2);
			return {
				tenant_id: tenantId,
				name: name,
				slug: slugify(name),
				description: faker.lorem.paragraph(),
				created_at: now().toDate(),
				updated_at: now().toDate(),
			};
		});

		return await this.db
			.insert(blogCategoryEntity)
			.values(categoriesSeed)
			.returning();
	}
}
