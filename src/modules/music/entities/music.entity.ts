import { type Entity } from "@infrastructure/types/server";

import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { type FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { type MusicTrackSchema } from "../schemas/music.schema";

export const musicTrackEntity = pgTable(
	"music_tracks",
	{
		id: serial().primaryKey(),
		title: varchar({ length: 200 }).notNull(),
		artist: varchar({ length: 100 }).notNull(),
		duration_seconds: integer().notNull(),
		sort_order: integer().notNull().default(0),
		is_featured: boolean().notNull().default(false),
		is_public: boolean().notNull().default(true),
		audio_file: jsonb().$type<FilesSchema[]>().notNull(),
		cover: jsonb().$type<FilesSchema[] | null>().default([]),
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
	(table) => [index("music_tracks_tenant_idx").on(table.tenant_id)],
);

export const musicTrackEntityRelations = relations(
	musicTrackEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [musicTrackEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type MusicTrackEntity = Entity<
	MusicTrackSchema,
	InferSelectModel<typeof musicTrackEntity>
>;
