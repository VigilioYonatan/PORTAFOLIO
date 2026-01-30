import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, desc, eq, getTableColumns, SQL, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { WorkExperienceQueryDto } from "../dtos/work-experience.query.dto";
import { workExperienceEntity } from "../entities/work-experience.entity";
import type { WorkExperienceSchema } from "../schemas/work-experience.schema";

@Injectable()
export class WorkExperienceRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: Omit<
			WorkExperienceSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<WorkExperienceSchema> {
		const [result] = await this.db
			.insert(workExperienceEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<WorkExperienceSchema>,
	): Promise<WorkExperienceSchema> {
		const [result] = await this.db
			.update(workExperienceEntity)
			.set({ ...body })
			.where(
				and(
					eq(workExperienceEntity.id, id),
					eq(workExperienceEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<WorkExperienceSchema | null> {
		const result = await this.db.query.workExperienceEntity.findFirst({
			where: and(
				eq(workExperienceEntity.tenant_id, tenant_id),
				eq(workExperienceEntity.id, id),
			),
		});
		return toNull(result);
	}

	async index(
		tenant_id: number,
		query: WorkExperienceQueryDto,
	): Promise<[WorkExperienceSchema[], number]> {
		const { limit, offset, is_current, is_visible, sortBy, sortDir } = query;

		const baseWhere: SQL[] = [eq(workExperienceEntity.tenant_id, tenant_id)];

		if (is_current !== undefined) {
			baseWhere.push(eq(workExperienceEntity.is_current, is_current));
		}
		if (is_visible !== undefined) {
			baseWhere.push(eq(workExperienceEntity.is_visible, is_visible));
		}
		if (query.language !== undefined) {
			baseWhere.push(eq(workExperienceEntity.language, query.language));
		}

		const baseWhereClause = and(...baseWhere);

		// Default sort by sort_order DESC (typical for work experience)
		let orderBy: SQL<unknown>[] = [desc(workExperienceEntity.sort_order)];

		if (sortBy && sortDir) {
			const columns = getTableColumns(workExperienceEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const result = await Promise.all([
			this.db.query.workExperienceEntity.findMany({
				limit,
				offset,
				where: baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(workExperienceEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async destroy(tenant_id: number, id: number): Promise<WorkExperienceSchema> {
		const [result] = await this.db
			.delete(workExperienceEntity)
			.where(
				and(
					eq(workExperienceEntity.id, id),
					eq(workExperienceEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async bulkStore(
		tenant_id: number,
		items: Omit<
			WorkExperienceSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>[],
	): Promise<WorkExperienceSchema[]> {
		const results = await this.db
			.insert(workExperienceEntity)
			.values(items.map((item) => ({ ...item, tenant_id })))
			.returning();
		return results;
	}
}
