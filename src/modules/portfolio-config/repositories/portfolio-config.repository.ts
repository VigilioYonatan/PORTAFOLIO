import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { portfolioConfigEntity } from "@modules/portfolio-config/entities/portfolio-config.entity";
import type {
	PortfolioConfigSchema,
	PortfolioConfigShowSchema,
} from "@modules/portfolio-config/schemas/portfolio-config.schema";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class PortfolioConfigRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	/**
	 * Obtiene la configuración del portfolio por tenant_id
	 */
	async show(tenant_id: number): Promise<PortfolioConfigShowSchema | null> {
		const result = await this.db.query.portfolioConfigEntity.findFirst({
			where: eq(portfolioConfigEntity.tenant_id, tenant_id),
		});
		return toNull(result);
	}

	/**
	 * Actualiza la configuración del portfolio por tenant_id
	 */
	async update(
		tenant_id: number,
		body: Partial<PortfolioConfigSchema>,
	): Promise<PortfolioConfigSchema> {
		const [result] = await this.db
			.update(portfolioConfigEntity)
			.set({ ...body })
			.where(eq(portfolioConfigEntity.tenant_id, tenant_id))
			.returning();
		return result;
	}
}
