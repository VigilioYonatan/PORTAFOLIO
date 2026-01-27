import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { blogPostEntity } from "@modules/blog-post/entities/blog-post.entity";
import { Inject, Injectable } from "@nestjs/common";
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
import type { BlogCategoryQueryDto } from "../dtos/blog-category.query.dto";
import { blogCategoryEntity } from "../entities/blog-category.entity";
import type { BlogCategorySchema } from "../schemas/blog-category.schema";

@Injectable()
export class BlogCategoryRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: Omit<BlogCategorySchema, "id" | "tenant_id" | "created_at" | "updated_at">,
	): Promise<BlogCategorySchema> {
		const [result] = await this.db
			.insert(blogCategoryEntity)
			.values({
				...body,
				tenant_id,
			})
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<BlogCategorySchema>,
	): Promise<BlogCategorySchema> {
		const [result] = await this.db
			.update(blogCategoryEntity)
			.set(body)
			.where(
				and(
					eq(blogCategoryEntity.id, id),
					eq(blogCategoryEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<BlogCategorySchema | null> {
		const result = await this.db.query.blogCategoryEntity.findFirst({
			where: and(
				eq(blogCategoryEntity.id, id),
				eq(blogCategoryEntity.tenant_id, tenant_id),
			),
		});
		return toNull(result);
	}

	async index(
		tenant_id: number,
		query: BlogCategoryQueryDto,
	): Promise<[BlogCategorySchema[], number]> {
		// Base filters
		const baseWhere: SQL[] = [eq(blogCategoryEntity.tenant_id, tenant_id)];

		if (query.search) {
			baseWhere.push(ilike(blogCategoryEntity.name, `%${query.search}%`));
		}
		const baseWhereClause = and(...baseWhere);

		// Cursor filter
		const cursorWhere: SQL[] = [...baseWhere];
		if (query.cursor) {
			cursorWhere.push(lt(blogCategoryEntity.id, Number(query.cursor)));
		}
		const cursorWhereClause = and(...cursorWhere);

		// Dynamic Sorting
		let orderBy: SQL<unknown>[] = [desc(blogCategoryEntity.id)];
		if (query.sortBy && query.sortDir) {
			const columns = getTableColumns(blogCategoryEntity);
			const column = columns[query.sortBy as keyof typeof columns];
			if (column) {
				orderBy = [query.sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		// Check if sorting is compatible with cursor pagination
		const isCursorCompatible =
			!query.sortBy || query.sortBy === "id" || query.sortBy === "created_at";
		const useCursor = query.cursor && isCursorCompatible;

		const result = await Promise.all([
			this.db.query.blogCategoryEntity.findMany({
				limit: useCursor ? query.limit! + 1 : query.limit!,
				offset: useCursor ? undefined : query.offset,
				where: useCursor ? cursorWhereClause : baseWhereClause,
				orderBy: orderBy,
				columns: {
					description: false,
				},
				extras: {
					description: sql<string>`substring(${blogCategoryEntity.description} from 1 for 3000)`.as(
						"description",
					),
				},
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(blogCategoryEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async hasPosts(tenant_id: number, id: number): Promise<boolean> {
		const [result] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(blogPostEntity)
			.where(
				and(
					eq(blogPostEntity.category_id, id),
					eq(blogPostEntity.tenant_id, tenant_id),
				),
			);
		return Number(result.count) > 0;
	}

	async destroy(tenant_id: number, id: number): Promise<BlogCategorySchema> {
		const [result] = await this.db
			.delete(blogCategoryEntity)
			.where(
				and(
					eq(blogCategoryEntity.id, id),
					eq(blogCategoryEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}
}
