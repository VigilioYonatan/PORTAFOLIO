import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import type { ChatMessageSchema } from "../schemas/chat-message.schema";
import { conversationEntity } from "./conversation.entity";

export const chatRoleEnum = pgEnum("chat_role_enum", [
	"USER",
	"ASSISTANT",
	"SYSTEM",
	"ADMIN",
]);

export const chatMessageEntity = pgTable(
	"chat_messages",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		role: chatRoleEnum().notNull().default("USER"),
		content: text().notNull(),
		sources: jsonb().$type<ChatMessageSchema["sources"]>().notNull().default([]),
		is_read: boolean().notNull().default(false),
		conversation_id: integer()
			.notNull()
			.references(() => conversationEntity.id, { onDelete: "cascade" }),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("chat_messages_conversation_idx").on(table.conversation_id),
		index("chat_messages_tenant_idx").on(table.tenant_id),
	],
);

export const chatMessageRelations = relations(chatMessageEntity, ({ one }) => ({
	tenant: one(tenantEntity, {
		fields: [chatMessageEntity.tenant_id],
		references: [tenantEntity.id],
	}),
	conversation: one(conversationEntity, {
		fields: [chatMessageEntity.conversation_id],
		references: [conversationEntity.id],
	}),
}));

export type ChatMessageEntity = Entity<
	ChatMessageSchema,
	InferSelectModel<typeof chatMessageEntity>
>;
