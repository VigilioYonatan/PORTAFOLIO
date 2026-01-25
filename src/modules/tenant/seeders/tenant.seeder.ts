import { faker } from "@faker-js/faker";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { tenantEntity } from "../entities/tenant.entity";
import { tenantSettingEntity } from "../entities/tenant-setting.entity";
import type { TenantSchema } from "../schemas/tenant.schema";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";

@Injectable()
export class TenantSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run() {
		const tenantsSeed: Omit<TenantSchema, "id">[] = Array.from({
			length: 10,
		}).map((_, i) => {
			const name = faker.company.name();
			return {
				name,
				slug: slugify(name) + (i > 0 ? `-${i}` : ""),
				domain: i === 0 ? "localhost" : `${faker.internet.domainName()}`,
				email: faker.internet.email(),
				phone: faker.phone.number().slice(0, 20),
				address: faker.location.streetAddress(),
				plan: faker.helpers.arrayElement([
					"FREE",
					"BASIC",
					"PRO",
					"ENTERPRISE",
				]),
				is_active: true,
				logo: null,
				trial_ends_at: null,
				created_at: new Date(),
				updated_at: new Date(),
			};
		});

		return await this.db.transaction(async (tx) => {
			const insertedTenants = await tx
				.insert(tenantEntity)
				.values(tenantsSeed)
				.returning();

			const tenantSettings: Omit<TenantSettingSchema, "id">[] =
				insertedTenants.map((tenant) => ({
					tenant_id: tenant.id,
					color_primary: faker.color.rgb(),
					color_secondary: faker.color.rgb(),
					default_language: faker.helpers.arrayElement(["ES", "EN", "PT"]),
					is_verified: true,
					time_zone: "America/Lima" as const,
					created_at: now().toDate(),
					updated_at: now().toDate(),
				}));
			await tx.insert(tenantSettingEntity).values(tenantSettings);

			return insertedTenants;
		});
	}
}
