import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import type { TechnologySchema } from "../schemas/technology.schema";

export const technologyCategoryEnum = pgEnum("technology_category_enum", [
	"FRONTEND",
	"BACKEND",
	"DATABASE",
	"DEVOPS",
	"LANGUAGE",
]);

export const technologyEntity = pgTable(
	"technologies",
	{
		id: serial().primaryKey(),
		name: varchar({ length: 100 }).notNull(),
		category: technologyCategoryEnum().notNull(),
		icon: jsonb().$type<FilesSchema[]>().notNull().default([]),
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
		// Index for multi-tenant isolation and performance in lookups
		index("technologies_tenant_idx").on(table.tenant_id),
		// Ensure technology names are unique per tenant (SaaS best practice)
		unique("technologies_tenant_name_unique").on(table.tenant_id, table.name),
	],
);

export const technologyEntityRelations = relations(
	technologyEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [technologyEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type TechnologyEntity = Entity<
	TechnologySchema,
	InferSelectModel<typeof technologyEntity>
>;
