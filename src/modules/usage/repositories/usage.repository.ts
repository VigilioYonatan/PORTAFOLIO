import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, type SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { UsageQuotaQueryDto } from "../dtos/usage-quota.query.dto";
import { usageQuotaEntity } from "../entities/usage-quota.entity";
import type { UsageQuotaSchema } from "../schemas/usage-quota.schema";

@Injectable()
export class UsageRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async showCurrent(tenant_id: number): Promise<UsageQuotaSchema | null> {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1; // JS months are 0-indexed

		const result = await this.db.query.usageQuotaEntity.findFirst({
			where: and(
				eq(usageQuotaEntity.tenant_id, tenant_id),
				eq(usageQuotaEntity.year, currentYear),
				eq(usageQuotaEntity.month, currentMonth),
			),
		});

		return toNull(result);
	}

	async indexHistory(
		tenant_id: number,
		query: UsageQuotaQueryDto,
	): Promise<UsageQuotaSchema[]> {
		const filters: SQL[] = [eq(usageQuotaEntity.tenant_id, tenant_id)];

		if (query.year) {
			filters.push(eq(usageQuotaEntity.year, query.year));
		}
		if (query.month) {
			filters.push(eq(usageQuotaEntity.month, query.month));
		}

		const result = await this.db.query.usageQuotaEntity.findMany({
			where: and(...filters),
			orderBy: [desc(usageQuotaEntity.year), desc(usageQuotaEntity.month)],
		});

		return result;
	}

	async store(
		tenant_id: number,
		body: Omit<
			UsageQuotaSchema,
			"id" | "created_at" | "updated_at" | "tenant_id"
		>,
	): Promise<UsageQuotaSchema> {
		const [result] = await this.db
			.insert(usageQuotaEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}
}
