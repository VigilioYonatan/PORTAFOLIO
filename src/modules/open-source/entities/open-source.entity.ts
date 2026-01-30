import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid/date.utils";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import type { OpenSourceSchema } from "../schemas/open-source.schema";

export const openSourceLanguageEnum = pgEnum("open_source_language_enum", [
	"en",
	"es",
	"pt",
]);

export const openSourceEntity = pgTable(
	"open_source",
	{
		id: serial().primaryKey(),
		name: varchar({ length: 150 }).notNull(),
		slug: varchar({ length: 200 }).notNull(),
		description: varchar({ length: 500 }).notNull(),
		content: text(),
		npm_url: varchar({ length: 255 }),
		repo_url: varchar({ length: 255 }),
		category: varchar({ length: 50 }),
		stars: integer().notNull().default(0),
		downloads: integer().notNull().default(0),
		version: varchar({ length: 50 }),
		is_visible: boolean().notNull().default(true),
		sort_order: integer().notNull().default(0),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		language: openSourceLanguageEnum().notNull().default("en"),
		parent_id: integer().references((): AnyPgColumn => openSourceEntity.id),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("open_source_tenant_idx").on(table.tenant_id),
		index("open_source_slug_idx").on(table.tenant_id, table.slug),
		unique("open_source_tenant_slug_unique").on(table.tenant_id, table.slug),
	],
);

export const openSourceEntityRelations = relations(
	openSourceEntity,
	({ one, many }) => ({
		tenant: one(tenantEntity, {
			fields: [openSourceEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		parent: one(openSourceEntity, {
			fields: [openSourceEntity.parent_id],
			references: [openSourceEntity.id],
			relationName: "translations",
		}),
		translations: many(openSourceEntity, {
			relationName: "translations",
		}),
	}),
);

export type OpenSourceEntity = Entity<
	OpenSourceSchema,
	InferSelectModel<typeof openSourceEntity>
>;
