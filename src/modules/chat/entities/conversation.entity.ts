import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { userEntity } from "@modules/user/entities/user.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import type { ConversationSchema } from "../schemas/conversation.schema";

export const chatModeEnum = pgEnum("chat_mode_enum", ["AI", "LIVE"]);

export const conversationEntity = pgTable(
	"conversations",
	{
		id: serial().primaryKey(),
		ip_address: varchar({ length: 45 }).notNull(), // IPv6 compatible
		title: varchar({ length: 200 }).notNull(), // Título de la conversación
		mode: chatModeEnum().notNull().default("AI"), // Modo: AI = chatbot, LIVE = admin
		is_active: boolean().notNull().default(true), // Estado de la conversación
		visitor_id: uuid().notNull(), // UUID único del visitante (browser persistence)
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		user_id: integer().references(() => userEntity.id), // Admin que responde (nullable)
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		// Índice para búsqueda por tenant
		index("conversations_tenant_idx").on(table.tenant_id),
		// Índice para búsqueda por visitor_id
		index("conversations_visitor_idx").on(table.visitor_id),
		// Índice para admin que responde
		index("conversations_user_idx").on(table.user_id),
		// Índice compuesto para visitante por tenant
		index("conversations_tenant_visitor_idx").on(
			table.tenant_id,
			table.visitor_id,
		),
	],
);

export const conversationRelations = relations(
	conversationEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [conversationEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		user: one(userEntity, {
			fields: [conversationEntity.user_id],
			references: [userEntity.id],
		}),
	}),
);

export type ConversationEntity = Entity<
	ConversationSchema,
	InferSelectModel<typeof conversationEntity>
>;
