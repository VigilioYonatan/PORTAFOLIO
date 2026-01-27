import { documentEntity } from "@modules/documents/entities/document.entity";
import { integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { conversationEntity } from "./conversation.entity";

export const conversationDocumentEntity = pgTable(
	"conversation_documents",
	{
		conversation_id: integer()
			.notNull()
			.references(() => conversationEntity.id, { onDelete: "cascade" }),
		document_id: integer()
			.notNull()
			.references(() => documentEntity.id, { onDelete: "cascade" }),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		primaryKey({
			columns: [table.conversation_id, table.document_id],
		}),
	],
);

// Relations moved to chat.relations.ts
