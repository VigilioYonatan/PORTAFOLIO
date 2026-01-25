import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { userEntity } from "@modules/user/entities/user.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { DocumentSchema } from "../schemas/document.schema";
import { documentChunkEntity } from "./document-chunk.entity";

// Enum para el estado del procesamiento del documento
export const documentStatusEnum = pgEnum("document_status_enum", [
	"PENDING",
	"PROCESSING",
	"READY",
	"FAILED",
]);

export const documentEntity = pgTable(
	"documents",
	{
		id: serial().primaryKey(),
		title: varchar({ length: 200 }).notNull(),
		chunk_count: integer().notNull().default(0),
		is_indexed: boolean().notNull().default(false),
		status: documentStatusEnum().notNull().default("PENDING"),
		file: jsonb().$type<FilesSchema>().notNull(), // Single FileUpload object
		metadata: jsonb().$type<Record<string, string>>(), // Optional metadata
		processed_at: timestamp({ withTimezone: true, mode: "date" }),
		// FKs
		user_id: integer()
			.notNull()
			.references(() => userEntity.id),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		// Timestamps
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		// Index for tenant isolation queries
		index("documents_tenant_idx").on(table.tenant_id),
		// Index for user-based queries
		index("documents_user_idx").on(table.user_id),
	],
);

export const documentEntityRelations = relations(
	documentEntity,
	({ one, many }) => ({
		tenant: one(tenantEntity, {
			fields: [documentEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		user: one(userEntity, {
			fields: [documentEntity.user_id],
			references: [userEntity.id],
		}),
		chunks: many(documentChunkEntity),
	}),
);

export type DocumentEntity = Entity<
	DocumentSchema,
	InferSelectModel<typeof documentEntity>
>;
