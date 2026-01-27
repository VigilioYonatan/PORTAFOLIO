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
import type {
	ConversationQueryDto,
} from "../dtos/chat.class.dto";
import { chatMessageEntity } from "../entities/chat-message.entity";
import { conversationEntity } from "../entities/conversation.entity";
import { type ChatMessageSchema } from "../schemas/chat-message.schema";
import { type ConversationSchema } from "../schemas/conversation.schema";

@Injectable()
export class ChatRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async storeConversation(
		tenant_id: number,
		body: Omit<
			ConversationSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<ConversationSchema> {
		const [result] = await this.db
			.insert(conversationEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async storeMessage(
		tenant_id: number,
		body: Omit<
			ChatMessageSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<ChatMessageSchema> {
		const [result] = await this.db
			.insert(chatMessageEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async indexConversations(
		tenant_id: number,
		query: ConversationQueryDto,
	): Promise<[ConversationSchema[], number]> {
		const {
			limit,
			offset,
			mode,
			is_active,
			visitor_id,
			sortBy,
			sortDir,
			search,
			grouped,
		} = query;

		const baseWhere: SQL[] = [eq(conversationEntity.tenant_id, tenant_id)];

		if (mode) baseWhere.push(eq(conversationEntity.mode, mode));
		if (is_active !== undefined)
			baseWhere.push(eq(conversationEntity.is_active, is_active));
		if (visitor_id)
			baseWhere.push(eq(conversationEntity.visitor_id, visitor_id));
		if (search) baseWhere.push(ilike(conversationEntity.title, `%${search}%`));

		const baseWhereClause = and(...baseWhere);

		// If grouped by IP, we only want the latest conversation for each IP
		if (grouped) {
			// Subquery to get the latest updated_at for each ip_address
			const latestConversations = this.db
				.select({
					latest_ip: conversationEntity.ip_address,
					max_updated: sql<string>`MAX(${conversationEntity.updated_at})`.as(
						"max_updated",
					),
				})
				.from(conversationEntity)
				.where(baseWhereClause)
				.groupBy(conversationEntity.ip_address)
				.as("latest_convs");

			const itemsQuery = this.db
				.select()
				.from(conversationEntity)
				.innerJoin(
					latestConversations,
					and(
						eq(conversationEntity.ip_address, latestConversations.latest_ip),
						eq(conversationEntity.updated_at, latestConversations.max_updated),
					),
				)
				.orderBy(desc(conversationEntity.updated_at))
				.limit(limit || 20)
				.offset(offset || 0);

			const countQuery = this.db
				.select({ count: sql<number>`COUNT(DISTINCT ${conversationEntity.ip_address})` })
				.from(conversationEntity)
				.where(baseWhereClause);

			const [items, countResult] = await Promise.all([
				itemsQuery,
				countQuery,
			]);

			// Format items to remove join structure
			return [items.map(i => i.conversations), Number(countResult[0].count)];
		}

		let orderBy: SQL<unknown>[] = [desc(conversationEntity.updated_at)];

		if (sortBy && sortDir) {
			const columns = getTableColumns(conversationEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const result = await Promise.all([
			this.db.query.conversationEntity.findMany({
				limit,
				offset,
				where: baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(conversationEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async getMessages(conversation_id: number): Promise<ChatMessageSchema[]> {
		return await this.db.query.chatMessageEntity.findMany({
			where: eq(chatMessageEntity.conversation_id, conversation_id),
			orderBy: [asc(chatMessageEntity.created_at)],
		});
	}

	async showConversation(
		tenant_id: number,
		id: number,
	): Promise<ConversationSchema | null> {
		const result = await this.db.query.conversationEntity.findFirst({
			where: and(
				eq(conversationEntity.id, id),
				eq(conversationEntity.tenant_id, tenant_id),
			),
		});
		return toNull(result);
	}

	async countByTenant(tenant_id: number): Promise<number> {
		const result = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(conversationEntity)
			.where(eq(conversationEntity.tenant_id, tenant_id));
		return Number(result[0].count);
	}

	async countWeeklyByTenant(
		tenant_id: number,
	): Promise<{ day: string; count: number }[]> {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const result = await this.db
			.select({
				day: sql<string>`DATE(${conversationEntity.created_at})`,
				count: sql<number>`count(*)`,
			})
			.from(conversationEntity)
			.where(
				and(
					eq(conversationEntity.tenant_id, tenant_id),
					sql`${conversationEntity.created_at} >= ${sevenDaysAgo}`,
				),
			)
			.groupBy(sql`DATE(${conversationEntity.created_at})`)
			.orderBy(sql`DATE(${conversationEntity.created_at})`);

		return result.map((r) => ({ day: r.day, count: Number(r.count) }));
	}

	async updateConversationMode(
		tenant_id: number,
		conversation_id: number,
		mode: ConversationSchema["mode"],
	): Promise<void> {
		await this.db
			.update(conversationEntity)
			.set({ mode })
			.where(
				and(
					eq(conversationEntity.id, conversation_id),
					eq(conversationEntity.tenant_id, tenant_id),
				),
			);
	}
}

