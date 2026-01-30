import { userEntity } from "@modules/user/entities/user.entity";
import {
	integer,
	json,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

export const subscriptionEntity = pgTable(
	"subscriptions",
	{
		id: serial("id").primaryKey(),
		tenant_id: integer("tenant_id").notNull(),
		user_id: integer("user_id").references(() => userEntity.id),
		endpoint: text("endpoint").notNull(),
		keys: json("keys").$type<{ p256dh: string; auth: string }>().notNull(),
		user_agent: text("user_agent"),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "date",
		})
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "date",
		})
			.defaultNow()
			.notNull(),
	},
	(t) => [unique().on(t.endpoint)],
);
