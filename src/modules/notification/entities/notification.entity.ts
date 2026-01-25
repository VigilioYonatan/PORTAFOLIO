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
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { NotificationSchema } from "../schemas/notification.schema";

export const notificationTypeEnum = pgEnum("notification_type_enum", [
	"LIKE",
	"COMMENT",
	"CONTACT",
	"SYSTEM",
]);

export const notificationEntity = pgTable(
	"notifications",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		user_id: integer()
			.notNull()
			.references(() => userEntity.id),
		type: notificationTypeEnum().notNull(),
		title: varchar({ length: 100 }).notNull(),
		content: text().notNull(),
		link: varchar({ length: 500 }),
		is_read: boolean().notNull().default(false),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(table) => [
		index("notifications_tenant_idx").on(table.tenant_id),
		index("notifications_read_idx").on(table.tenant_id, table.is_read),
		index("notifications_user_idx").on(table.user_id),
	],
);

export const notificationRelations = relations(
	notificationEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [notificationEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		user: one(userEntity, {
			fields: [notificationEntity.user_id],
			references: [userEntity.id],
		}),
	}),
);

export type NotificationEntity = Entity<
	NotificationSchema,
	InferSelectModel<typeof notificationEntity>
>;
