import type { SeoMetadataSchema } from "@infrastructure/schemas/seo.schema";
import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid/date.utils";
import { techeableEntity } from "@modules/techeable/entities/techeable.entity";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	jsonb,
	date as pgDate,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import type { ProjectSchema } from "../schemas/project.schema";

export const projectStatusEnum = pgEnum("project_status_enum", [
	"live",
	"in_dev",
	"archived",
]);
export const projectLanguageEnum = pgEnum("project_language_enum", [
	"en",
	"es",
	"pt",
]);

export const projectEntity = pgTable(
	"projects",
	{
		id: serial().primaryKey(),
		title: varchar({ length: 200 }).notNull(),
		slug: varchar({ length: 200 }).notNull(),
		description: varchar({ length: 500 }).notNull(),
		content: text().notNull(), // Markdown long text
		impact_summary: text().notNull(),
		website_url: varchar({ length: 500 }),
		repo_url: varchar({ length: 500 }),
		github_stars: integer().default(0),
		github_forks: integer().default(0),
		languages_stats: jsonb().$type<{ name: string; percent: number }[]>(),
		sort_order: integer().notNull().default(0),
		is_featured: boolean().notNull().default(false),
		is_visible: boolean().notNull().default(true),
		status: projectStatusEnum().notNull().default("in_dev"),
		images: jsonb().$type<FilesSchema[]>(),
		videos: jsonb().$type<FilesSchema[]>(),
		seo: jsonb().$type<SeoMetadataSchema>(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		language: projectLanguageEnum().notNull().default("es"),
		parent_id: integer().references((): AnyPgColumn => projectEntity.id),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		start_date: pgDate("start_date", { mode: "date" }).notNull(),
		end_date: pgDate("end_date", { mode: "date" }),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("projects_tenant_idx").on(table.tenant_id),
		unique("projects_tenant_slug_unique").on(table.tenant_id, table.slug),
	],
);

export const projectEntityRelations = relations(
	projectEntity,
	({ one, many }) => ({
		tenant: one(tenantEntity, {
			fields: [projectEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		techeables: many(techeableEntity),
		parent: one(projectEntity, {
			fields: [projectEntity.parent_id],
			references: [projectEntity.id],
			relationName: "translations",
		}),
		translations: many(projectEntity, {
			relationName: "translations",
		}),
	}),
);

export type ProjectEntity = Entity<
	ProjectSchema,
	InferSelectModel<typeof projectEntity>
>;
