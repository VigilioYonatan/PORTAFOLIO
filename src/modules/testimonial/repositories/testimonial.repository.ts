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
	lt,
	SQL,
	sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { TestimonialQueryDto } from "../dtos/testimonial.query.dto";
import { testimonialEntity } from "../entities/testimonial.entity";
import type { TestimonialSchema } from "../schemas/testimonial.schema";

@Injectable()
export class TestimonialRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async index(
		tenant_id: number,
		query: TestimonialQueryDto,
	): Promise<[TestimonialSchema[], number]> {
		const { limit, offset, search, cursor, sortBy, sortDir, is_visible } =
			query;

		// Base filters
		const baseWhere: SQL[] = [eq(testimonialEntity.tenant_id, tenant_id)];

		if (is_visible !== undefined) {
			baseWhere.push(eq(testimonialEntity.is_visible, is_visible));
		}

		if (search) {
			baseWhere.push(ilike(testimonialEntity.author_name, `%${search}%`));
		}

		const baseWhereClause = and(...baseWhere);

		// Cursor filter (applied ONLY to Data)
		const cursorWhere: SQL[] = [...baseWhere];
		if (cursor) {
			cursorWhere.push(lt(testimonialEntity.id, Number(cursor)));
		}
		const cursorWhereClause =
			cursorWhere.length > 0 ? and(...cursorWhere) : baseWhereClause;

		// Ordenar por sort_order por defecto (para landing page)
		let orderBy: SQL<unknown>[] = [asc(testimonialEntity.sort_order)];
		if (sortBy && sortDir) {
			const columns = getTableColumns(testimonialEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const isCursorCompatible =
			!sortBy || sortBy === "id" || sortBy === "created_at";
		const useCursor = cursor && isCursorCompatible;

		const result = await Promise.all([
			this.db.query.testimonialEntity.findMany({
				limit: useCursor ? limit! + 1 : limit!,
				offset: useCursor ? undefined : offset,
				where: useCursor ? cursorWhereClause : baseWhereClause,
				orderBy: orderBy,
				columns: {
					content: false,
				},
				extras: {
					content:
						sql<string>`substring(${testimonialEntity.content} from 1 for 3000)`.as(
							"content",
						),
				},
			}) as Promise<TestimonialSchema[]>,
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(testimonialEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<TestimonialSchema | null> {
		const result = await this.db.query.testimonialEntity.findFirst({
			where: and(
				eq(testimonialEntity.id, id),
				eq(testimonialEntity.tenant_id, tenant_id),
			),
		});
		return toNull(result);
	}

	async store(
		tenant_id: number,
		body: Omit<
			TestimonialSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<TestimonialSchema> {
		const [result] = await this.db
			.insert(testimonialEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<TestimonialSchema>,
	): Promise<TestimonialSchema> {
		const [result] = await this.db
			.update(testimonialEntity)
			.set(body)
			.where(
				and(
					eq(testimonialEntity.id, id),
					eq(testimonialEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async destroy(tenant_id: number, id: number): Promise<TestimonialSchema> {
		const [result] = await this.db
			.delete(testimonialEntity)
			.where(
				and(
					eq(testimonialEntity.id, id),
					eq(testimonialEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}
}
