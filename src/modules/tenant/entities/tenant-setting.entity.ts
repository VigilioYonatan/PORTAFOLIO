import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { type InferSelectModel } from "drizzle-orm";
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";
import { tenantEntity } from "./tenant.entity";

export const languageEnum = pgEnum("language_enum", ["ES", "EN", "PT"]);
export const timezoneEnum = pgEnum("timezone_enum", [
	"UTC",
	"America/Lima",
	"America/New_York",
	"America/Bogota",
	"America/Mexico_City",
]);

export const tenantSettingEntity = pgTable("tenant_setting", {
	id: serial().primaryKey(),
	is_verified: boolean().notNull().default(false),
	color_primary: varchar({ length: 50 }).notNull().default("#000000"),
	color_secondary: varchar({ length: 50 }).notNull().default("#ffffff"),
	default_language: languageEnum().notNull().default("ES"),
	time_zone: timezoneEnum().default("UTC"),
	tenant_id: integer()
		.notNull()
		.unique()
		.references(() => tenantEntity.id),
	created_at: timestamp({ withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
	updated_at: timestamp({ withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow()
		.$onUpdate(() => now().toDate()),
});

export type TenantSettingEntity = Entity<
	TenantSettingSchema,
	InferSelectModel<typeof tenantSettingEntity>
>;
