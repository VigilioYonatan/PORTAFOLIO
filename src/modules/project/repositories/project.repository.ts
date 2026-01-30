import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { techeableEntity } from "@modules/techeable/entities/techeable.entity";
import { TECHEABLE_TYPES } from "@modules/techeable/schemas/techeable.schema";
import { Inject, Injectable } from "@nestjs/common";
import type { Lang } from "@src/i18n";
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	ilike,
	lt,
	SQL,
	sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ProjectQueryDto } from "../dtos/project.query.dto";
import { projectEntity } from "../entities/project.entity";
import type {
	ProjectSchema,
	ProjectWithRelations,
} from "../schemas/project.schema";

@Injectable()
export class ProjectRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: Omit<ProjectSchema, "id" | "tenant_id" | "created_at" | "updated_at">,
	): Promise<ProjectSchema> {
		// 1. Crear el proyecto
		const [result] = await this.db
			.insert(projectEntity)
			.values({ ...body, tenant_id })
			.returning();

		return result;
	}

	async bulkStore(
		tenant_id: number,
		bodies: Omit<
			ProjectSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>[],
	): Promise<ProjectSchema[]> {
		if (bodies.length === 0) return [];
		return await this.db
			.insert(projectEntity)
			.values(bodies.map((body) => ({ ...body, tenant_id })))
			.returning();
	}

	async storeTecheables(
		tenant_id: number,
		project_id: number,
		technology_ids: number[],
	): Promise<void> {
		if (technology_ids.length === 0) return;

		await this.db.insert(techeableEntity).values(
			technology_ids.map((techId) => ({
				techeable_id: project_id,
				techeable_type: TECHEABLE_TYPES[0], // PORTFOLIO_PROJECT
				technology_id: techId,
				tenant_id,
			})),
		);
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<ProjectSchema>,
	): Promise<ProjectSchema> {
		// 1. Update Project
		const [result] = await this.db
			.update(projectEntity)
			.set({ ...body })
			.where(
				and(eq(projectEntity.id, id), eq(projectEntity.tenant_id, tenant_id)),
			)
			.returning();

		return result;
	}

	async destroyTecheables(
		tenant_id: number,
		project_id: number,
	): Promise<void> {
		await this.db
			.delete(techeableEntity)
			.where(
				and(
					eq(techeableEntity.techeable_id, project_id),
					eq(techeableEntity.techeable_type, TECHEABLE_TYPES[0]),
					eq(techeableEntity.tenant_id, tenant_id),
				),
			);
	}

	async showBySlug(
		tenant_id: number,
		slug: string,
		language?: Lang,
	): Promise<ProjectWithRelations | null> {
		const result = await this.db.query.projectEntity.findFirst({
			where: and(
				eq(projectEntity.tenant_id, tenant_id),
				eq(projectEntity.slug, slug),
				language ? eq(projectEntity.language, language) : undefined,
			),
			with: {
				techeables: { with: { technology: true } },
				translations: true,
				parent: { with: { translations: true } },
			},
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
	): Promise<[ProjectWithRelations[], number]> {
		const {
			limit,
			offset,
			is_featured,
			is_visible,
			sortBy,
			sortDir,
			search,
			cursor,
			status,
			language,
		} = query;

		const baseWhere: SQL[] = [eq(projectEntity.tenant_id, tenant_id)];

		if (is_featured !== undefined) {
			baseWhere.push(eq(projectEntity.is_featured, is_featured));
		}
		if (is_visible !== undefined) {
			baseWhere.push(eq(projectEntity.is_visible, is_visible));
		}
		if (search) {
			baseWhere.push(ilike(projectEntity.title, `%${search}%`));
		}
		if (status) {
			baseWhere.push(eq(projectEntity.status, status));
		}
		if (language) {
			baseWhere.push(eq(projectEntity.language, language));
		}

		const baseWhereClause = and(...baseWhere);

		const cursorWhere: SQL[] = [...baseWhere];
		if (cursor) {
			cursorWhere.push(lt(projectEntity.id, Number(cursor)));
		}
		const cursorWhereClause = and(...cursorWhere);

		// Default sort by sort_order ASC (typical for portfolio)
		let orderBy: SQL<unknown>[] = [asc(projectEntity.sort_order)];

		if (sortBy && sortDir) {
			const columns = getTableColumns(projectEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		// Project default is sort_order ASC, which is NOT compatible with ID cursor (lt).
		// Only enable cursor if sorting by ID DESC.
		const isCursorCompatible = sortBy === "id" && sortDir === "DESC";
		const useCursor = cursor && isCursorCompatible;

		const result = await Promise.all([
			this.db.query.projectEntity.findMany({
				limit: useCursor ? (limit ?? 10) + 1 : limit,
				offset: useCursor ? undefined : offset,
				where: useCursor ? cursorWhereClause! : baseWhereClause!,
				orderBy: orderBy,
				with: {
					techeables: { with: { technology: true } },
				},
				columns: {
					content: false,
					impact_summary: false,
				},
				extras: {
					content:
						sql<string>`substring(${projectEntity.content} from 1 for 3000)`.as(
							"content",
						),
					impact_summary:
						sql<string>`substring(${projectEntity.impact_summary} from 1 for 3000)`.as(
							"impact_summary",
						),
				},
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(projectEntity)
				.where(baseWhereClause!)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async destroy(tenant_id: number, id: number): Promise<ProjectSchema> {
		const [result] = await this.db
			.delete(projectEntity)
			.where(
				and(eq(projectEntity.id, id), eq(projectEntity.tenant_id, tenant_id)),
			)
			.returning();
		return result;
	}
}
