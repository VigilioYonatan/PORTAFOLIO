import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid/date.utils";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	boolean,
	date as pgDate,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { WorkExperienceSchema } from "../schemas/work-experience.schema";

export const workExperienceEntity = pgTable(
	"work_experiences",
	{
		id: serial().primaryKey(),
		company: varchar({ length: 100 }).notNull(),
		position: varchar({ length: 100 }).notNull(),
		description: text().notNull(),
		location: varchar({ length: 100 }),
		sort_order: integer().notNull().default(0),
		is_current: boolean().notNull().default(false),
		is_visible: boolean().notNull().default(true),
		start_date: pgDate("start_date", { mode: "date" }).notNull(),
		end_date: pgDate("end_date", { mode: "date" }),
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
	(table) => [index("work_experiences_tenant_idx").on(table.tenant_id)],
);

export const workExperienceEntityRelations = relations(
	workExperienceEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [workExperienceEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type WorkExperienceEntity = Entity<
	WorkExperienceSchema,
	InferSelectModel<typeof workExperienceEntity>
>;
