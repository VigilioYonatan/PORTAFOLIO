import { type Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { userEntity } from "@modules/user/entities/user.entity";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { type SocialCommentSchema } from "../schemas/social-comment.schema";

export const socialCommentEntity = pgTable(
	"social_comments",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		name: varchar({ length: 100 }).notNull(),
		surname: varchar({ length: 100 }).notNull(),
		content: text().notNull(),
		commentable_id: integer().notNull(),
		commentable_type: varchar({ length: 50 })
			.$type<SocialCommentSchema["commentable_type"]>()
			.notNull(),
		visitor_id: varchar({ length: 50 }).$type<string>(), // UUID string
		ip_address: varchar({ length: 45 }),
		is_visible: boolean().notNull().default(true),
		user_id: integer().references(() => userEntity.id), // Admin reply FK
		reply: text(),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("social_comments_commentable_idx").on(
			table.commentable_id,
			table.commentable_type,
		),
		index("social_comments_tenant_idx").on(table.tenant_id),
		index("social_comments_visitor_idx").on(table.visitor_id),
	],
);

export const socialCommentRelations = relations(
	socialCommentEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [socialCommentEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		user: one(userEntity, {
			fields: [socialCommentEntity.user_id],
			references: [userEntity.id],
		}),
	}),
);

export type SocialCommentEntity = Entity<
	SocialCommentSchema,
	InferSelectModel<typeof socialCommentEntity>
>;
