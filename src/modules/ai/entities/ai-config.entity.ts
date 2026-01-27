import type { Entity } from "@infrastructure/types/server";
import { decimalCustom } from "@infrastructure/utils/server/decimal.utils";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import type { AiConfigSchema } from "../schemas/ai-config.schema";

export const aiModelConfigEntity = pgTable(
	"ai_model_config",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),

		// Model Parameters
		chat_model: text().notNull().default("gpt-4o-mini"),
		embedding_model: text().notNull().default("text-embedding-3-small"),
		embedding_dimensions: integer().notNull().default(1536),

		system_prompt: text(),
		temperature: decimalCustom(3, 2).notNull().default(0.7),
		max_tokens: integer().notNull().default(2000),

		chunk_size: integer().notNull().default(1000),
		chunk_overlap: integer().notNull().default(200),
		is_active: boolean().notNull().default(true),

		// Timestamps
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("ai_model_config_tenant_idx").on(table.tenant_id)],
);

export const aiModelConfigRelations = relations(
	aiModelConfigEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [aiModelConfigEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type AiModelConfigEntity = Entity<
	AiConfigSchema,
	InferSelectModel<typeof aiModelConfigEntity>
>;
