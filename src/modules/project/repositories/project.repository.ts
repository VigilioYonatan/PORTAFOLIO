import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	ilike,
	SQL,
	sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ProjectQueryDto } from "../dtos/project.query.dto";
import type { ProjectStoreDto } from "../dtos/project.store.dto";
import { projectEntity } from "../entities/project.entity";
import type { ProjectSchema } from "../schemas/project.schema";

@Injectable()
export class ProjectRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: ProjectStoreDto,
	): Promise<ProjectSchema> {
		const [result] = await this.db
			.insert(projectEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async update(
		id: number,
		tenant_id: number,
		body: Partial<ProjectSchema>,
	): Promise<ProjectSchema> {
		const [result] = await this.db
			.update(projectEntity)
			.set({ ...body })
			.where(
				and(eq(projectEntity.id, id), eq(projectEntity.tenant_id, tenant_id)),
			)
			.returning();
		return result;
	}

	async showBySlug(
		tenant_id: number,
		slug: string,
	): Promise<ProjectSchema | null> {
		const result = await this.db.query.projectEntity.findFirst({
			where: and(
				eq(projectEntity.tenant_id, tenant_id),
				eq(projectEntity.slug, slug),
			),
		});
		return toNull(result);
	}

	async showById(tenant_id: number, id: number): Promise<ProjectSchema | null> {
		const result = await this.db.query.projectEntity.findFirst({
			where: and(
				eq(projectEntity.tenant_id, tenant_id),
				eq(projectEntity.id, id),
			),
		});
		return toNull(result);
	}

	async index(
		tenant_id: number,
		query: ProjectQueryDto,
	): Promise<[ProjectSchema[], number]> {
		const { limit, offset, is_featured, is_visible, sortBy, sortDir } = query;

		const baseWhere: SQL[] = [eq(projectEntity.tenant_id, tenant_id)];

		if (is_featured !== undefined) {
			baseWhere.push(eq(projectEntity.is_featured, is_featured));
		}
		if (is_visible !== undefined) {
			baseWhere.push(eq(projectEntity.is_visible, is_visible));
		}

		const baseWhereClause = and(...baseWhere);

		// Default sort by sort_order ASC (typical for portfolio)
		let orderBy: SQL<unknown>[] = [asc(projectEntity.sort_order)];

		if (sortBy && sortDir) {
			const columns = getTableColumns(projectEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const result = await Promise.all([
			this.db.query.projectEntity.findMany({
				limit,
				offset,
				where: baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(projectEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async destroy(id: number, tenant_id: number): Promise<ProjectSchema> {
		const [result] = await this.db
			.delete(projectEntity)
			.where(
				and(eq(projectEntity.id, id), eq(projectEntity.tenant_id, tenant_id)),
			)
			.returning();
		return result;
	}
}
