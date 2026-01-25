import { projectEntity } from "@modules/project/entities/project.entity";
import { technologyEntity } from "@modules/technology/entities/technology.entity";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

export const techeableEntity = pgTable(
	"techeables",
	{
		id: serial("id").primaryKey(),
		techeable_id: integer("techeable_id").notNull(),
		techeable_type: text("techeable_type").notNull(), // 'PORTFOLIO_PROJECT' | 'BLOG_POST'
		technology_id: integer("technology_id")
			.notNull()
			.references(() => technologyEntity.id),
		tenant_id: integer("tenant_id")
			.notNull()
			.references(() => tenantEntity.id),
		created_at: timestamp("created_at").defaultNow().notNull(),
		updated_at: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		unique_techeable_technology: unique("unique_techeable_technology").on(
			table.techeable_id,
			table.techeable_type,
			table.technology_id,
			table.tenant_id,
		),
	}),
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
