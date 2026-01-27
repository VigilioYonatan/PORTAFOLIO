import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid/date.utils";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { workExperienceEntity } from "@modules/work-experience/entities/work-experience.entity";
import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	index,
	integer,
	date as pgDate,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { WorkMilestoneSchema } from "../schemas/work-milestone.schema";

export const workMilestoneEntity = pgTable(
	"work_milestones",
	{
		id: serial().primaryKey(),
		title: varchar({ length: 100 }).notNull(),
		description: varchar({ length: 500 }).notNull(),
		icon: varchar({ length: 100 }),
		milestone_date: pgDate({ mode: "date" }).notNull(),
		sort_order: integer().notNull().default(0),
		work_experience_id: integer()
			.notNull()
			.references(() => workExperienceEntity.id, { onDelete: "cascade" }),
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
		index("work_milestones_tenant_idx").on(table.tenant_id),
		// Index for filtering milestones by experience
		index("work_milestones_experience_idx").on(table.work_experience_id),
	],
);

export const workMilestoneEntityRelations = relations(
	workMilestoneEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [workMilestoneEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		experience: one(workExperienceEntity, {
			fields: [workMilestoneEntity.work_experience_id],
			references: [workExperienceEntity.id],
		}),
	}),
);

export type WorkMilestoneEntity = Entity<
	WorkMilestoneSchema,
	InferSelectModel<typeof workMilestoneEntity>
>;
