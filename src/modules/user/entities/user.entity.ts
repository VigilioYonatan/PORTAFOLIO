import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { tenantEntity } from "../../tenant/entities/tenant.entity";
import type { UserSchema } from "../schemas/user.schema";

export const userStatusEnum = pgEnum("user_status_enum", [
	"ACTIVE",
	"BANNED",
	"PENDING",
]);

export const userEntity = pgTable(
	"users",
	{
		id: serial().primaryKey(),
		username: varchar({ length: 50 }).notNull(),
		email: varchar({ length: 100 }).notNull(),
		phone_number: varchar({ length: 50 }),
		password: varchar({ length: 200 }).notNull(),
		google_id: varchar({ length: 100 }),
		qr_code_token: varchar({ length: 100 }),
		status: userStatusEnum().notNull().default("PENDING"),
		security_stamp: uuid().notNull().defaultRandom(),
		failed_login_attempts: integer().notNull().default(0),
		is_mfa_enabled: boolean().notNull().default(false),
		is_superuser: boolean().notNull().default(false),
		email_verified_at: timestamp(),
		lockout_end_at: timestamp(),
		mfa_secret: text(),
		last_ip_address: varchar({ length: 45 }),
		last_login_at: timestamp({ withTimezone: true, mode: "date" }),
		avatar: jsonb().$type<FilesSchema[] | null>(),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
		deleted_at: timestamp({ withTimezone: true, mode: "date" }),
		// FKs
		role_id: integer().notNull(), // Assuming roleEntity exists? Not in rules-class.md diagram explicitly but used in user class
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
	},
	(table) => [
		unique("user_email_tenant_unique").on(table.tenant_id, table.email),
		unique("user_qr_token_unique").on(table.qr_code_token), // QR token likely unique globally or per tenant? Rules say (UQ). Assuming global for safety or per tenant. Let's stick to simple UQ if business rules allow. But SaaS rules say "Unicidad SaaS... por cliente".
		// rules-class says qr_code_token (UQ).
	],
);

export const userEntityRelations = relations(userEntity, ({ one }) => ({
	tenant: one(tenantEntity, {
		fields: [userEntity.tenant_id],
		references: [tenantEntity.id],
	}),
}));

export type UserEntity = Entity<
	UserSchema,
	InferSelectModel<typeof userEntity>
>;
