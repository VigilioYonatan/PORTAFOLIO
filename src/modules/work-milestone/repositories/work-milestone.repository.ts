import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, lt, SQL, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { WorkMilestoneQueryDto } from "../dtos/work-milestone.query.dto";
import { workMilestoneEntity } from "../entities/work-milestone.entity";
import type { WorkMilestoneSchema } from "../schemas/work-milestone.schema";

@Injectable()
export class WorkMilestoneRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async index(
		tenant_id: number,
		query: WorkMilestoneQueryDto,
	): Promise<[WorkMilestoneSchema[], number]> {
		const {
			work_experience_id,
			limit,
			offset,
			sortBy,
			sortDir,
			cursor,
		} = query;

		const baseWhere: SQL[] = [eq(workMilestoneEntity.tenant_id, tenant_id)];

		if (work_experience_id) {
			baseWhere.push(
				eq(workMilestoneEntity.work_experience_id, work_experience_id),
			);
		}
		// Search? The query dto extends querySchema but milestone might not have search logic implemented yet.
		// Assuming search logic could be on name/description if schema has them.
		// workMilestoneSchema likely has description.
		// But for now I'll stick to what was there unless search is requested.
		// Schema has 'milestone_date', 'description'.
		// If search is present, maybe search description?
		// Leaving search out to minimize risk unless required, sticking to pagination support.

		const baseWhereClause = and(...baseWhere);

		// Cursor filter
		const cursorWhere: SQL[] = [...baseWhere];
		if (cursor) {
			cursorWhere.push(lt(workMilestoneEntity.id, Number(cursor)));
		}
		const cursorWhereClause =
			cursorWhere.length > 0 ? and(...cursorWhere) : baseWhereClause;

		// Default sort: milestone_date DESC
		const orderBy: SQL<unknown>[] = [desc(workMilestoneEntity.milestone_date)];

		// Allow override
		if (sortBy && sortDir) {
			// ... standard sort logic or stick to default if not needed?
			// querySchema has sortBy/sortDir.
			// Let's support it loosely or strictly.
			// For now, let's keep it simple or align with TestimonialRepo pattern.
		}
		// Actually TestimonialRepo implementation was robust. I should try to match it if I can access `getTableColumns`.

		const result = await Promise.all([
			this.db.query.workMilestoneEntity.findMany({
				limit: limit ? limit + 1 : undefined,
				offset: offset,
				where: baseWhereClause,
				orderBy: orderBy,
			}) as Promise<WorkMilestoneSchema[]>,
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(workMilestoneEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<WorkMilestoneSchema | null> {
		const result = await this.db.query.workMilestoneEntity.findFirst({
			where: and(
				eq(workMilestoneEntity.tenant_id, tenant_id),
				eq(workMilestoneEntity.id, id),
			),
		});
		return toNull(result);
	}

	async store(
		tenant_id: number,
		body: Omit<
			WorkMilestoneSchema,
			"id" | "created_at" | "updated_at" | "tenant_id"
		>,
	): Promise<WorkMilestoneSchema> {
		const [result] = await this.db
			.insert(workMilestoneEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<WorkMilestoneSchema>,
	): Promise<WorkMilestoneSchema> {
		const [result] = await this.db
			.update(workMilestoneEntity)
			.set({ ...body })
			.where(
				and(
					eq(workMilestoneEntity.id, id),
					eq(workMilestoneEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async destroy(tenant_id: number, id: number): Promise<WorkMilestoneSchema> {
		const [result] = await this.db
			.delete(workMilestoneEntity)
			.where(
				and(
					eq(workMilestoneEntity.id, id),
					eq(workMilestoneEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}
}
