import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel } from "drizzle-orm";
import {
	boolean,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { TenantSchema } from "../schemas/tenant.schema";

export const planEnum = pgEnum("plan_enum", [
	"FREE",
	"BASIC",
	"PRO",
	"ENTERPRISE",
]);
export const languageEnum = pgEnum("language_enum", ["ES", "EN", "PT"]);

export const tenantEntity = pgTable("tenants", {
	id: serial().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull().unique(),
	domain: varchar({ length: 100 }).unique(),
	logo: jsonb().$type<FilesSchema[]>(),
	email: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	address: text(),
	plan: planEnum().notNull().default("FREE"),
	is_active: boolean().notNull().default(true),
	trial_ends_at: timestamp(),
	created_at: timestamp({ withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
	updated_at: timestamp({ withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow()
		.$onUpdate(() => now().toDate()),
});

export type TenantEntity = Entity<
	TenantSchema,
	InferSelectModel<typeof tenantEntity>
>;
