import { relations } from "drizzle-orm";
import { tenantEntity } from "./tenant.entity";
import { tenantSettingEntity } from "./tenant-setting.entity";

export const tenantEntityRelations = relations(tenantEntity, ({ one }) => ({
	setting: one(tenantSettingEntity, {
		fields: [tenantEntity.id],
		references: [tenantSettingEntity.tenant_id],
	}),
}));

export const tenantSettingEntityRelations = relations(
	tenantSettingEntity,
	({ one }) => ({
		tenant: one(tenantEntity, {
			fields: [tenantSettingEntity.tenant_id],
			references: [tenantEntity.id],
		}),
	}),
);
