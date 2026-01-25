import type { Entity } from "@infrastructure/types/server";
import { now } from "@infrastructure/utils/hybrid";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { TestimonialSchema } from "../schemas/testimonial.schema";

export const testimonialEntity = pgTable(
	"testimonials",
	{
		id: serial().primaryKey(),
		author_name: varchar({ length: 100 }).notNull(), // nombre del autor
		author_role: varchar({ length: 100 }).notNull(), // rol/cargo del autor
		author_company: varchar({ length: 100 }), // empresa del autor (nullable)
		content: text().notNull(), // contenido del testimonio
		sort_order: integer().notNull().default(0), // orden de aparición
		is_visible: boolean().notNull().default(true), // visibilidad pública
		avatar: jsonb().$type<FilesSchema[] | null>(), // avatar del autor (nullable)
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
	(table) => [
		// Índice para ordenar testimonios visibles por sort_order
		index("idx_testimonials_visible_sort").on(
			table.is_visible,
			table.sort_order,
		),
		index("idx_testimonials_tenant").on(table.tenant_id),
	],
);

export const testimonialEntityRelations = relations(
	testimonialEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [testimonialEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);

export type TestimonialEntity = Entity<
	TestimonialSchema,
	InferSelectModel<typeof testimonialEntity>
>;
