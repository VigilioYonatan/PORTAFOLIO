import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid/date.utils";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import type { BlogCategorySchema } from "../schemas/blog-category.schema";

export const blogCategoryEntity = pgTable(
	"blog_categories",
	{
		id: serial().primaryKey(),
		name: varchar({ length: 100 }).notNull(),
		slug: varchar({ length: 100 }).notNull(),
		description: text(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("blog_categories_tenant_idx").on(table.tenant_id),
		unique("blog_categories_tenant_slug_unique").on(
			table.tenant_id,
			table.slug,
		),
		unique("blog_categories_tenant_name_unique").on(
			table.tenant_id,
			table.name,
		),
	],
);

export const blogCategoryEntityRelations = relations(
	blogCategoryEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [blogCategoryEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type BlogCategoryEntity = Entity<
	BlogCategorySchema,
	InferSelectModel<typeof blogCategoryEntity>
>;
