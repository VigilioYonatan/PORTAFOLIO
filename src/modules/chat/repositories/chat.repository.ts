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
	ChatMessageStoreDto,
	ConversationQueryDto,
	ConversationStoreDto,
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
		body: ConversationStoreDto,
	): Promise<ConversationSchema> {
		const [result] = await this.db
			.insert(conversationEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async storeMessage(
		tenant_id: number,
		body: ChatMessageStoreDto,
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
		} = query;

		const baseWhere: SQL[] = [eq(conversationEntity.tenant_id, tenant_id)];

		if (mode) baseWhere.push(eq(conversationEntity.mode, mode));
		if (is_active !== undefined)
			baseWhere.push(eq(conversationEntity.is_active, is_active));
		if (visitor_id)
			baseWhere.push(eq(conversationEntity.visitor_id, visitor_id));
		if (search) baseWhere.push(ilike(conversationEntity.title, `%${search}%`));

		const baseWhereClause = and(...baseWhere);

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
}
