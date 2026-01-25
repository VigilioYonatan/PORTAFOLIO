import type { SeoMetadataSchema } from "@infrastructure/schemas/seo.schema";
import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { blogCategoryEntity } from "@modules/blog-category/entities/blog-category.entity";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { userEntity } from "@modules/user/entities/user.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import type { BlogPostSchema } from "../schemas/blog-post.schema";

export const blogPostEntity = pgTable(
	"blog_posts",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		title: varchar({ length: 200 }).notNull(),
		slug: varchar({ length: 200 }).notNull(),
		content: text().notNull(),
		extract: varchar({ length: 500 }),
		is_published: boolean().notNull().default(false),
		reading_time_minutes: integer(),
		cover: jsonb().$type<FilesSchema[] | null>(),
		seo: jsonb().$type<SeoMetadataSchema>(),
		published_at: timestamp({ withTimezone: true, mode: "date" }),
		category_id: integer().references(() => blogCategoryEntity.id),
		author_id: integer()
			.notNull()
			.references(() => userEntity.id),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("blog_posts_tenant_idx").on(table.tenant_id),
		index("blog_posts_category_idx").on(table.category_id),
		index("blog_posts_author_idx").on(table.author_id),
		unique("blog_posts_tenant_slug_unique").on(table.tenant_id, table.slug),
	],
);

export const blogPostEntityRelations = relations(blogPostEntity, ({ one }) => ({
	tenant: one(tenantEntity, {
		fields: [blogPostEntity.tenant_id],
		references: [tenantEntity.id],
	}),
	category: one(blogCategoryEntity, {
		fields: [blogPostEntity.category_id],
		references: [blogCategoryEntity.id],
	}),
	author: one(userEntity, {
		fields: [blogPostEntity.author_id],
		references: [userEntity.id],
	}),
}));

export type BlogPostEntity = Entity<
	BlogPostSchema,
	InferSelectModel<typeof blogPostEntity>
>;
