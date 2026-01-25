import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import type { ContactMessageSchema } from "@modules/contact/schemas/contact-message.schema";
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
	varchar,
} from "drizzle-orm/pg-core";

export const contactMessageEntity = pgTable(
	"contact_messages",
	{
		id: serial().primaryKey(),
		tenant_id: integer().references(() => tenantEntity.id),
		name: text().notNull(),
		email: varchar({ length: 255 }).notNull(),
		phone_number: varchar({ length: 50 }),
		subject: varchar({ length: 200 }),
		message: text().notNull(),
		ip_address: varchar({ length: 45 }),
		is_read: boolean().default(false).notNull(),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
		deleted_at: timestamp({ withTimezone: true, mode: "date" }),
	},
	(table) => [
		index("idx_contact_msgs_tenant").on(table.tenant_id),
		index("idx_contact_msgs_tenant_read").on(table.tenant_id, table.is_read),
	],
);

export const contactMessageRelations = relations(
	contactMessageEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [contactMessageEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type ContactMessageEntity = Entity<
	ContactMessageSchema,
	InferSelectModel<typeof contactMessageEntity>
>;
