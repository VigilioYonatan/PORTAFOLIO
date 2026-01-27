import { projectEntity } from "@modules/project/entities/project.entity";
import { technologyEntity } from "@modules/technology/entities/technology.entity";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { relations } from "drizzle-orm";
import {
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

export const techeableTypeEnum = pgEnum("techeable_type_enum", [
	"PORTFOLIO_PROJECT",
	"BLOG_POST",
]);

export const techeableEntity = pgTable(
	"techeables",
	{
		id: serial().primaryKey(),
		techeable_id: integer().notNull(),
		techeable_type: techeableTypeEnum().notNull(), // 'PORTFOLIO_PROJECT' | 'BLOG_POST'
		technology_id: integer()
			.notNull()
			.references(() => technologyEntity.id),
		tenant_id: integer()
			.notNull()
			.references(() => tenantEntity.id),
		created_at: timestamp({ withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updated_at: timestamp({ withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		unique("unique_techeable_technology").on(
			table.techeable_id,
			table.techeable_type,
			table.technology_id,
			table.tenant_id,
		),
	],
);

export const techeableEntityRelations = relations(
	techeableEntity,
	({ one }) => ({
		technology: one(technologyEntity, {
			fields: [techeableEntity.technology_id],
			references: [technologyEntity.id],
		}),
		tenant: one(tenantEntity, {
			fields: [techeableEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		project: one(projectEntity, {
			fields: [techeableEntity.techeable_id],
			references: [projectEntity.id],
		}),
	}),
);
