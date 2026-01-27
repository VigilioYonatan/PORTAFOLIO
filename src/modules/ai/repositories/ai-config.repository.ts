import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { aiModelConfigEntity } from "../entities/ai-config.entity";
import type { AiConfigSchema } from "../schemas/ai-config.schema";

@Injectable()
export class AiConfigRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async show(tenant_id: number): Promise<AiConfigSchema | null> {
		const result = await this.db.query.aiModelConfigEntity.findFirst({
			where: eq(aiModelConfigEntity.tenant_id, tenant_id),
		});
		return toNull(result);
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<AiConfigSchema>,
	): Promise<AiConfigSchema> {
		const [result] = await this.db
			.update(aiModelConfigEntity)
			.set(body)
			.where(
				and(
					eq(aiModelConfigEntity.id, id),
					eq(aiModelConfigEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async store(
		tenant_id: number,
		body: Omit<
			AiConfigSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<AiConfigSchema> {
		const [result] = await this.db
			.insert(aiModelConfigEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}
}
