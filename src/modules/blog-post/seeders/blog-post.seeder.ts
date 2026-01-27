import { faker } from "@faker-js/faker";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { Inject, Injectable } from "@nestjs/common";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { blogPostEntity } from "../entities/blog-post.entity";

@Injectable()
export class BlogPostSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number, author_id: number, category_id?: number) {
		const posts = Array.from({ length: 20 }).map(() => {
			const title = faker.lorem.sentence();
			return {
				tenant_id,
				title,
				slug: slugify(title),
				content: faker.lorem.paragraphs(3),
				extract: faker.lorem.paragraph(),
				is_published: faker.datatype.boolean(),
				reading_time_minutes: faker.number.int({ min: 1, max: 20 }),
				cover: null,
				seo: null,
				published_at: faker.date.past(),
				category_id: category_id || null,
				author_id,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			};
		});

		return await this.db.insert(blogPostEntity).values(posts).returning();
	}
}
