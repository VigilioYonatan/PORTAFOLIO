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
import type { MusicQueryDto } from "../dtos/music.query.dto";
import { musicTrackEntity } from "../entities/music.entity";
import type { MusicTrackSchema } from "../schemas/music.schema";

@Injectable()
export class MusicTrackRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: Omit<
			MusicTrackSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<MusicTrackSchema> {
		const [result] = await this.db
			.insert(musicTrackEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<MusicTrackSchema>,
	): Promise<MusicTrackSchema> {
		const [result] = await this.db
			.update(musicTrackEntity)
			.set(body)
			.where(
				and(
					eq(musicTrackEntity.id, id),
					eq(musicTrackEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result as MusicTrackSchema;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<MusicTrackSchema | null> {
		const result = await this.db.query.musicTrackEntity.findFirst({
			where: and(
				eq(musicTrackEntity.tenant_id, tenant_id),
				eq(musicTrackEntity.id, id),
			),
		});
		return toNull(result);
	}

	async index(
		tenant_id: number,
		query: MusicQueryDto,
	): Promise<[MusicTrackSchema[], number]> {
		const { limit, offset, is_featured, is_public, sortBy, sortDir, search } =
			query;

		const baseWhere: SQL[] = [eq(musicTrackEntity.tenant_id, tenant_id)];

		if (is_featured !== undefined) {
			baseWhere.push(eq(musicTrackEntity.is_featured, is_featured));
		}
		if (is_public !== undefined) {
			baseWhere.push(eq(musicTrackEntity.is_public, is_public));
		}
		if (search) {
			baseWhere.push(ilike(musicTrackEntity.title, `%${search}%`));
		}

		const baseWhereClause = and(...baseWhere);

		let orderBy: SQL<unknown>[] = [asc(musicTrackEntity.sort_order)];

		if (sortBy && sortDir) {
			const columns = getTableColumns(musicTrackEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const [results, countResult] = await Promise.all([
			this.db.query.musicTrackEntity.findMany({
				limit,
				offset,
				where: baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(musicTrackEntity)
				.where(baseWhereClause),
		]);

		const count = Number(countResult[0]?.count ?? 0);

		return [results as MusicTrackSchema[], count];
	}

	async destroy(tenant_id: number, id: number): Promise<MusicTrackSchema> {
		const [result] = await this.db
			.delete(musicTrackEntity)
			.where(
				and(
					eq(musicTrackEntity.id, id),
					eq(musicTrackEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result as MusicTrackSchema;
	}
}
