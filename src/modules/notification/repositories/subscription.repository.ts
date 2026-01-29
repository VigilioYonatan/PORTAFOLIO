import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { SubscriptionStoreDto } from "../dtos/subscription.store.dto";
import { subscriptionEntity } from "../entities/subscription.entity";

@Injectable()
export class SubscriptionRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(tenant_id: number, user_id: number, body: SubscriptionStoreDto) {
		// Check if exists to update or create
		const [existing] = await this.db
			.select()
			.from(subscriptionEntity)
			.where(eq(subscriptionEntity.endpoint, body.endpoint));

		if (existing) {
			// Update keys if changed or user
			return await this.db
				.update(subscriptionEntity)
				.set({ user_id, keys: body.keys })
				.where(eq(subscriptionEntity.id, existing.id))
				.returning();
		}

		return await this.db
			.insert(subscriptionEntity)
			.values({
				tenant_id,
				user_id,
				endpoint: body.endpoint,
				keys: body.keys,
				user_agent: body.user_agent,
			})
			.returning();
	}

	async getByUser(tenant_id: number, user_id: number) {
		return await this.db
			.select()
			.from(subscriptionEntity)
			.where(
				and(
					eq(subscriptionEntity.user_id, user_id),
					eq(subscriptionEntity.tenant_id, tenant_id),
				),
			);
	}

	async deleteByEndpoint(endpoint: string) {
		return await this.db
			.delete(subscriptionEntity)
			.where(eq(subscriptionEntity.endpoint, endpoint));
	}
}
