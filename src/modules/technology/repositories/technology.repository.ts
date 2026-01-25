import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import {
	AnyColumn,
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	ilike,
	lt,
	or,
	SQL,
	sql,
} from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TechnologyQueryDto } from "../dtos/technology.query.dto";
import { TechnologyStoreDto } from "../dtos/technology.store.dto";
import { TechnologyUpdateDto } from "../dtos/technology.update.dto";
import { technologyEntity } from "../entities/technology.entity";
import { TechnologySchema } from "../schemas/technology.schema";

@Injectable()
export class TechnologyRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async index(
		tenant_id: number,
		query: TechnologyQueryDto,
	): Promise<[TechnologySchema[], number]> {
		const { limit, offset, search, cursor, sortBy, sortDir, category } = query;

		const baseWhere: SQL[] = [eq(technologyEntity.tenant_id, tenant_id)];

		if (search) {
			baseWhere.push(ilike(technologyEntity.name, `%${search}%`));
		}

		if (category) {
			baseWhere.push(eq(technologyEntity.category, category));
		}

		const baseWhereClause = and(...baseWhere);
		const cursorWhere: SQL[] = [...baseWhere];

		if (cursor) {
			cursorWhere.push(lt(technologyEntity.id, Number(cursor)));
		}

		const cursorWhereClause = and(...cursorWhere);

		let orderBy: SQL<unknown>[] = [desc(technologyEntity.id)];
		if (sortBy && sortDir) {
			const columns = getTableColumns(technologyEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const isCursorCompatible =
			!sortBy || sortBy === "id" || sortBy === "created_at";
		const useCursor = cursor && isCursorCompatible;

		const result = await Promise.all([
			this.db.query.technologyEntity.findMany({
				limit: useCursor ? limit! + 1 : limit!,
				offset: useCursor ? undefined : offset,
				where: useCursor ? cursorWhereClause : baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(technologyEntity)
				.where(baseWhereClause)
				.then((res) => Number(res[0].count)),
		]);

		return result;
	}

	async store(
		tenant_id: number,
		body: Omit<
			TechnologySchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<TechnologySchema> {
		const [result] = await this.db
			.insert(technologyEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<TechnologySchema>,
	): Promise<TechnologySchema> {
		const [result] = await this.db
			.update(technologyEntity)
			.set({ ...body })
			.where(
				and(
					eq(technologyEntity.id, id),
					eq(technologyEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<TechnologySchema | null> {
		const result = await this.db.query.technologyEntity.findFirst({
			where: and(
				eq(technologyEntity.id, id),
				eq(technologyEntity.tenant_id, tenant_id),
			),
		});
		return toNull(result);
	}

	async destroy(tenant_id: number, id: number): Promise<TechnologySchema> {
		const [result] = await this.db
			.delete(technologyEntity)
			.where(
				and(
					eq(technologyEntity.id, id),
					eq(technologyEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}
}
