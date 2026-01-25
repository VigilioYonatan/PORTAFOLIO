import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, SQL, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { AiInsightQueryDto } from "../dtos/ai-insight.query.dto";
import { aiInsightEntity } from "../entities/ai-insight.entity";
import type { AiInsightSchema } from "../schemas/ai-insight.schema";

@Injectable()
export class AiInsightRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async index(
		tenant_id: number,
		query: AiInsightQueryDto,
	): Promise<[AiInsightSchema[], number]> {
		const { limit = 10, offset = 0 } = query;

		const baseWhere: SQL[] = [eq(aiInsightEntity.tenant_id, tenant_id)];
		const baseWhereClause = and(...baseWhere);

		const result = await Promise.all([
			this.db.query.aiInsightEntity.findMany({
				limit: limit,
				offset: offset,
				where: baseWhereClause,
				orderBy: [desc(aiInsightEntity.generated_at)],
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(aiInsightEntity)
				.where(baseWhereClause)
				.then((res) => Number(res[0].count)),
		]);

		return result;
	}

	async store(
		tenant_id: number,
		body: Omit<
			AiInsightSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<AiInsightSchema> {
		const [result] = await this.db
			.insert(aiInsightEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}
}
