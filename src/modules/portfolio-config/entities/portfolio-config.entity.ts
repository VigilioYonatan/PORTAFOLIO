import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import type { PortfolioConfigSchema } from "../schemas/portfolio-config.schema";

/**
 * Enum para idioma por defecto
 * Referencia: rules-class.md/portfolio_config.default_language
 */
export const defaultLanguageEnum = pgEnum("default_language_enum", [
	"ES",
	"EN",
	"PT",
]);

/**
 * Enum para zona horaria
 * Referencia: rules-class.md/portfolio_config.time_zone
 */
export const timeZoneEnum = pgEnum("time_zone_enum", [
	"UTC",
	"America/Lima",
	"America/Bogota",
]);

/**
 * Entidad portfolio_config
 * Define la identidad del propietario del portfolio y la configuración del sitio.
 * Referencia: rules-class.md/portfolio_config
 *
 * NOTA: Esta es una tabla singleton (solo 1 registro) para el portfolio personal.
 * No tiene tenant_id ya que es un sistema single-owner, no SaaS.
 */
export const portfolioConfigEntity = pgTable(
	"portfolio_config",
	{
		id: serial().primaryKey(),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id), // Referencia al tenant (SaaS)
		name: varchar({ length: 100 }).notNull(), // Nombre del propietario
		profile_title: varchar({ length: 200 }).notNull(), // Título profesional
		biography: text().notNull(), // About Me (Markdown)
		email: varchar({ length: 100 }).notNull(), // Email de contacto
		phone: varchar({ length: 20 }), // Teléfono (nullable)
		address: text(), // Dirección (nullable)
		social_links: jsonb().$type<PortfolioConfigSchema["social_links"]>(), // JSONB: linkedin, github, twitter, etc.
		logo: jsonb().$type<FilesSchema[] | null>(), // FileUpload[]
		color_primary: varchar({ length: 50 }).notNull(), // Color primario hex
		color_secondary: varchar({ length: 50 }).notNull(), // Color secundario hex
		default_language: defaultLanguageEnum().notNull().default("ES"), // Idioma por defecto
		time_zone: timeZoneEnum(), // Zona horaria (nullable)
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => now().toDate()),
	},
	(t) => [
		unique("portfolio_config_tenant_unique").on(t.tenant_id), // Unica config por tenant
	],
);

/**
 * Relaciones de portfolio_config
 * Esta entidad no tiene relaciones externas según rules-class.md
 */
export const portfolioConfigEntityRelations = relations(
	portfolioConfigEntity,
	() => ({}),
);

/**
 * Tipado fuerte para la entidad
 */
export type PortfolioConfigEntity = Entity<
	PortfolioConfigSchema,
	InferSelectModel<typeof portfolioConfigEntity>
>;
