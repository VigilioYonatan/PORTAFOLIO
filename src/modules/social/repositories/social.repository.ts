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
import type { SocialCommentQueryDto } from "../dtos/social-comment.query.dto";
import type { SocialCommentStoreDto } from "../dtos/social-comment.store.dto";
import type { SocialReactionStoreDto } from "../dtos/social-reaction.store.dto";
import { socialCommentEntity } from "../entities/social-comment.entity";
import { socialReactionEntity } from "../entities/social-reaction.entity";
import { type SocialCommentSchema } from "../schemas/social-comment.schema";
import { type SocialReactionSchema } from "../schemas/social-reaction.schema";

@Injectable()
export class SocialRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async storeComment(
		tenant_id: number,
		body: SocialCommentStoreDto,
	): Promise<SocialCommentSchema> {
		const [result] = await this.db
			.insert(socialCommentEntity)
			.values({ ...body, tenant_id } as any)
			.returning();
		return result as any;
	}

	async storeReaction(
		tenant_id: number,
		body: SocialReactionStoreDto,
	): Promise<SocialReactionSchema> {
		const [result] = await this.db
			.insert(socialReactionEntity)
			.values({ ...body, tenant_id } as any)
			.returning();
		return result as any;
	}

	async findReaction(
		tenant_id: number,
		visitor_id: string,
		reactable_id: number,
		reactable_type: SocialReactionSchema["reactable_type"],
	): Promise<SocialReactionSchema | null> {
		const result = await this.db.query.socialReactionEntity.findFirst({
			where: and(
				eq(socialReactionEntity.tenant_id, tenant_id),
				eq(socialReactionEntity.visitor_id, visitor_id),
				eq(socialReactionEntity.reactable_id, reactable_id),
				eq(socialReactionEntity.reactable_type, reactable_type),
			),
		});
		return toNull(result);
	}

	async updateReaction(
		id: number,
		type: "LIKE" | "LOVE" | "CLAP" | "FIRE",
	): Promise<SocialReactionSchema> {
		const [result] = await this.db
			.update(socialReactionEntity)
			.set({ type })
			.where(eq(socialReactionEntity.id, id))
			.returning();
		return result as any;
	}

	async destroyReaction(id: number): Promise<void> {
		await this.db
			.delete(socialReactionEntity)
			.where(eq(socialReactionEntity.id, id));
	}

	async indexComments(
		tenant_id: number,
		query: SocialCommentQueryDto,
	): Promise<[SocialCommentSchema[], number]> {
		const { limit, offset, target_id, target_type, sortBy, sortDir, search } =
			query;

		const baseWhere: SQL[] = [eq(socialCommentEntity.tenant_id, tenant_id)];

		if (target_id)
			baseWhere.push(eq(socialCommentEntity.commentable_id, target_id));
		if (target_type)
			baseWhere.push(eq(socialCommentEntity.commentable_type, target_type));
		if (search)
			baseWhere.push(ilike(socialCommentEntity.content, `%${search}%`));

		const baseWhereClause = and(...baseWhere);

		let orderBy: SQL<unknown>[] = [desc(socialCommentEntity.created_at)];

		if (sortBy && sortDir) {
			const columns = getTableColumns(socialCommentEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const result = await Promise.all([
			this.db.query.socialCommentEntity.findMany({
				limit,
				offset,
				where: baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(socialCommentEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result as any;
	}

	async updateComment(
		tenant_id: number,
		id: number,
		body: Partial<SocialCommentSchema>,
	): Promise<SocialCommentSchema> {
		const [result] = await this.db
			.update(socialCommentEntity)
			.set({ ...body })
			.where(
				and(
					eq(socialCommentEntity.id, id),
					eq(socialCommentEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result as any;
	}

	async destroyComment(
		tenant_id: number,
		id: number,
	): Promise<SocialCommentSchema> {
		const [result] = await this.db
			.delete(socialCommentEntity)
			.where(
				and(
					eq(socialCommentEntity.id, id),
					eq(socialCommentEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result as any;
	}

	async getReactionCounts(
		reactable_id: number,
		reactable_type: SocialReactionSchema["reactable_type"],
	): Promise<Record<string, number>> {
		const results = await this.db
			.select({
				type: socialReactionEntity.type,
				count: sql<number>`count(*)`,
			})
			.from(socialReactionEntity)
			.where(
				and(
					eq(socialReactionEntity.reactable_id, reactable_id),
					eq(socialReactionEntity.reactable_type, reactable_type),
				),
			)
			.groupBy(socialReactionEntity.type);

		const counts: Record<string, number> = {};
		results.forEach((r) => {
			counts[r.type] = Number(r.count);
		});
		return counts;
	}
}
