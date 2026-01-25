import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	bigint,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import type { UsageQuotaSchema } from "../schemas/usage-quota.schema";

export const usageQuotaEntity = pgTable(
	"usage_quota",
	{
		id: serial().primaryKey(),
		year: integer().notNull(),
		month: integer().notNull(),
		documents_count: integer().notNull().default(0),
		messages_count: integer().notNull().default(0),
		tokens_count: integer().notNull().default(0),
		storage_bytes: bigint({ mode: "number" }).notNull().default(0),
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
		index("usage_quota_tenant_idx").on(table.tenant_id),
		unique("usage_quota_tenant_year_month_unique").on(
			table.tenant_id,
			table.year,
			table.month,
		),
	],
);

export const usageQuotaEntityRelations = relations(
	usageQuotaEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [usageQuotaEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type UsageQuotaEntity = Entity<
	UsageQuotaSchema,
	InferSelectModel<typeof usageQuotaEntity>
>;
