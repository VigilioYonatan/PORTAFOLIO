import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
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
import type { OpenSourceQueryDto } from "../dtos/open-source.query.dto";
import { openSourceEntity } from "../entities/open-source.entity";
import type { OpenSourceSchema } from "../schemas/open-source.schema";

@Injectable()
export class OpenSourceRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async index(
		tenant_id: number,
		query: OpenSourceQueryDto,
	): Promise<[OpenSourceSchema[], number]> {
		const {
			limit,
			offset,
			search,
			sortBy,
			sortDir,
			cursor,
			is_visible,
			language,
		} = query;

		const baseWhere: SQL[] = [eq(openSourceEntity.tenant_id, tenant_id)];

		if (is_visible !== undefined) {
			baseWhere.push(eq(openSourceEntity.is_visible, is_visible));
		}

		if (search) {
			baseWhere.push(ilike(openSourceEntity.name, `%${search}%`));
		}

		if (language) {
			baseWhere.push(eq(openSourceEntity.language, language));
		}

		const baseWhereClause = and(...baseWhere);

		// Cursor logic
		const cursorWhere: SQL[] = [...baseWhere];
		if (cursor) {
			cursorWhere.push(lt(openSourceEntity.id, Number(cursor)));
		}
		const cursorWhereClause = and(...cursorWhere);

		// Sorting logic
		let orderBy: SQL<unknown>[] = [
			desc(openSourceEntity.sort_order),
			desc(openSourceEntity.created_at),
		];

		if (sortBy && sortDir) {
			const columns = getTableColumns(openSourceEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		// Optimization: If cursor is present, we skip the count(*) to improve performance
		const isCursorCompatible = sortBy === "id" && sortDir === "DESC";
		const useCursor = cursor && isCursorCompatible;

		const resultsQuery = this.db.query.openSourceEntity.findMany({
			limit: useCursor ? (limit ?? 10) + 1 : limit,
			offset: useCursor ? undefined : offset,
			where: useCursor ? cursorWhereClause! : baseWhereClause!,
			orderBy,
			columns: {
				content: false,
			},
		});

		if (useCursor) {
			const results = await resultsQuery;
			// When using cursor, we return -1 or 0 for count as per "OMITIR conteo total" rule
			// actually we can just return the results and 0, or skip count query.
			return [results as OpenSourceSchema[], 0];
		}

		const [results, total] = await Promise.all([
			resultsQuery,
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(openSourceEntity)
				.where(baseWhereClause!)
				.then((res) => Number(res[0].count)),
		]);

		return [results as OpenSourceSchema[], total];
	}

	async show(tenant_id: number, id: number): Promise<OpenSourceSchema | null> {
		const result = await this.db.query.openSourceEntity.findFirst({
			where: and(
				eq(openSourceEntity.tenant_id, tenant_id),
				eq(openSourceEntity.id, id),
			),
		});
		return toNull(result);
	}

	async showBySlug(
		tenant_id: number,
		slug: string,
		language?: Lang,
	): Promise<OpenSourceSchema | null> {
		const result = await this.db.query.openSourceEntity.findFirst({
			where: and(
				eq(openSourceEntity.tenant_id, tenant_id),
				eq(openSourceEntity.slug, slug),
				language ? eq(openSourceEntity.language, language) : undefined,
			),
			with: {
				translations: true,
				parent: {
					with: {
						translations: true,
					},
				},
			},
		});
		return toNull(result);
	}

	async store(
		tenant_id: number,
		body: Omit<
			OpenSourceSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<OpenSourceSchema> {
		const [result] = await this.db
			.insert(openSourceEntity)
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
		body: Partial<OpenSourceSchema>,
	): Promise<OpenSourceSchema> {
		const [result] = await this.db
			.update(openSourceEntity)
			.set(body)
			.where(
				and(
					eq(openSourceEntity.tenant_id, tenant_id),
					eq(openSourceEntity.id, id),
				),
			)
			.returning();
		return result;
	}

	async destroy(tenant_id: number, id: number): Promise<OpenSourceSchema> {
		const [result] = await this.db
			.delete(openSourceEntity)
			.where(
				and(
					eq(openSourceEntity.tenant_id, tenant_id),
					eq(openSourceEntity.id, id),
				),
			)
			.returning();
		return result;
	}

	async bulkStore(
		tenant_id: number,
		items: Omit<
			OpenSourceSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>[],
	): Promise<OpenSourceSchema[]> {
		const results = await this.db
			.insert(openSourceEntity)
			.values(items.map((item) => ({ ...item, tenant_id })))
			.returning();
		return results;
	}
}
