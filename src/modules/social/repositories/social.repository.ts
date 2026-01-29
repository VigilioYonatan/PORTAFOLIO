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
		body: Omit<
			SocialCommentSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<SocialCommentSchema> {
		const [result] = await this.db
			.insert(socialCommentEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async storeReaction(
		tenant_id: number,
		body: Omit<
			SocialReactionSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<SocialReactionSchema> {
		const [result] = await this.db
			.insert(socialReactionEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async showReaction(
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
		tenant_id: number,
		id: number,
		type: SocialReactionSchema["type"],
	): Promise<SocialReactionSchema> {
		const [result] = await this.db
			.update(socialReactionEntity)
			.set({ type })
			.where(
				and(
					eq(socialReactionEntity.id, id),
					eq(socialReactionEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async destroyReaction(tenant_id: number, id: number): Promise<void> {
		await this.db
			.delete(socialReactionEntity)
			.where(
				and(
					eq(socialReactionEntity.id, id),
					eq(socialReactionEntity.tenant_id, tenant_id),
				),
			);
	}

	async indexComments(
		tenant_id: number,
		query: SocialCommentQueryDto,
	): Promise<[SocialCommentSchema[], number]> {
		const {
			limit,
			offset,
			commentable_id,
			commentable_type,
			sortBy,
			sortDir,
			search,
		} = query;

		const baseWhere: SQL[] = [eq(socialCommentEntity.tenant_id, tenant_id)];

		if (commentable_id)
			baseWhere.push(eq(socialCommentEntity.commentable_id, commentable_id));
		if (commentable_type)
			baseWhere.push(
				eq(socialCommentEntity.commentable_type, commentable_type),
			);
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
				columns: {
					content: false,
					reply: false,
				},
				extras: {
					content:
						sql<string>`substring(${socialCommentEntity.content} from 1 for 3000)`.as(
							"content",
						),
					reply:
						sql<string>`substring(${socialCommentEntity.reply} from 1 for 3000)`.as(
							"reply",
						),
				},
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(socialCommentEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
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
		return result;
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
		return result;
	}

	async showReactionCounts(
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
