import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { techeableEntity } from "../entities/techeable.entity";
import type { TecheableSchema } from "../schemas/techeable.schema";

@Injectable()
export class TecheableRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: Omit<
			TecheableSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<TecheableSchema> {
		const [result] = await this.db
			.insert(techeableEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
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
