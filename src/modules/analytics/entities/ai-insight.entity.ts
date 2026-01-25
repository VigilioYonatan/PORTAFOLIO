import { aiModelConfigEntity } from "@modules/ai/entities/ai-config.entity";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { relations } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";
import { type AiInsightSchema } from "../schemas/ai-insight.schema";

export const aiInsightEntity = pgTable(
	"ai_insights",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		insights_data: jsonb().notNull().$type<AiInsightSchema["insights_data"]>(),
		model_id: integer().references(() => aiModelConfigEntity.id),
		generated_at: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("ai_insights_tenant_idx").on(table.tenant_id)],
);

export const aiInsightRelations = relations(aiInsightEntity, ({ one }) => ({
	tenant: one(tenantEntity, {
		fields: [aiInsightEntity.tenant_id],
		references: [tenantEntity.id],
	}),
	model: one(aiModelConfigEntity, {
		fields: [aiInsightEntity.model_id],
		references: [aiModelConfigEntity.id],
	}),
}));
