import { type Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { type SocialReactionSchema } from "../schemas/social-reaction.schema";

export const reactionTypeEnum = pgEnum("reaction_type_enum", [
	"LIKE",
	"LOVE",
	"CLAP",
	"FIRE",
]);

export const socialReactionEntity = pgTable(
	"social_reactions",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		type: reactionTypeEnum().notNull().default("LIKE"),
		reactable_id: integer().notNull(),
		reactable_type: varchar({ length: 50 })
			.$type<SocialReactionSchema["reactable_type"]>()
			.notNull(),
		visitor_id: varchar({ length: 100 }).notNull(),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("social_reactions_reactable_idx").on(
			table.reactable_id,
			table.reactable_type,
		),
		index("social_reactions_tenant_idx").on(table.tenant_id),
		index("social_reactions_visitor_idx").on(table.visitor_id),
	],
);

export const socialReactionRelations = relations(
	socialReactionEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [socialReactionEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type SocialReactionEntity = Entity<
	SocialReactionSchema,
	InferSelectModel<typeof socialReactionEntity>
>;
