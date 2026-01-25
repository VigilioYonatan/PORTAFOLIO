import { type Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	customType,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { type DocumentChunkSchema } from "../schemas/document-chunk.schema";
import { documentEntity } from "./document.entity";

// Custom type for pgvector
const vector = customType<{ data: number[] }>({
	dataType() {
		return "vector(1536)";
	},
	fromDriver(value: any) {
		if (typeof value === "string") {
			return value.replace(/[[\]]/g, "").split(",").map(Number);
		}
		return value;
	},
	toDriver(value: number[]) {
		return `[${value.join(",")}]`;
	},
});

export const documentChunkEntity = pgTable(
	"document_chunks",
	{
		id: serial().primaryKey(),
		content: text().notNull(),
		embedding: vector("embedding"),
		chunk_index: integer().notNull(),
		token_count: integer().notNull(),
		document_id: integer()
			.notNull()
			.references(() => documentEntity.id, { onDelete: "cascade" }),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [index("document_chunks_document_idx").on(table.document_id)],
);

export const documentChunkEntityRelations = relations(
	documentChunkEntity,
	({ one }) => ({
		document: one(documentEntity, {
			fields: [documentChunkEntity.document_id],
			references: [documentEntity.id],
		}),
	}),
);

export type DocumentChunkEntity = Entity<
	DocumentChunkSchema,
	InferSelectModel<typeof documentChunkEntity>
>;
