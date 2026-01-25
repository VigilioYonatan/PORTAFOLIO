import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { TecheableStoreDto } from "../dtos/techeable.store.dto";
import { techeableEntity } from "../entities/techeable.entity";
import type { TecheableSchema } from "../schemas/techeable.schema";

@Injectable()
export class TecheableRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: TecheableStoreDto,
	): Promise<TecheableSchema> {
		const [result] = await this.db
			.insert(techeableEntity)
			.values({
				techeable_id: body.techeable_id,
				techeable_type:
					body.techeable_type as TecheableSchema["techeable_type"],
				technology_id: body.technology_id,
				tenant_id: tenant_id,
			})
			.returning();
		return result as unknown as TecheableSchema;
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<TecheableSchema | undefined> {
		const [result] = await this.db
			.delete(techeableEntity)
			.where(
				and(
					eq(techeableEntity.id, id),
					eq(techeableEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result as unknown as TecheableSchema;
	}
}
