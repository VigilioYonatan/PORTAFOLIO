import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ConversationStoreDto } from "../dtos/conversation.store.dto";
import { chatMessageEntity } from "../entities/chat-message.entity";
import { conversationEntity } from "../entities/conversation.entity";
import { type ChatMessageSchema } from "../schemas/chat-message.schema";
import { type ConversationSchema } from "../schemas/conversation.schema";

@Injectable()
export class ConversationRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: ConversationStoreDto & { ip_address: string },
	): Promise<ConversationSchema> {
		const [result] = await this.db
			.insert(conversationEntity)
			.values({
				...body,
				tenant_id,
				mode: "AI", // Default to AI as per schema/rules
				is_active: true,
			})
			.returning();
		return result;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<ConversationSchema | null> {
		const result = await this.db.query.conversationEntity.findFirst({
			where: and(
				eq(conversationEntity.tenant_id, tenant_id),
				eq(conversationEntity.id, id),
			),
		});
		return result || null;
	}

	async getRecentForAnalysis(
		tenant_id: number,
		limit_count: number,
	): Promise<(ConversationSchema & { messages: ChatMessageSchema[] })[]> {
		const result = await this.db.query.conversationEntity.findMany({
			where: eq(conversationEntity.tenant_id, tenant_id),
			orderBy: [desc(conversationEntity.created_at)],
			limit: limit_count,
			with: {
				messages: {
					orderBy: [asc(chatMessageEntity.created_at)],
				},
			},
		});
		return result as (ConversationSchema & { messages: ChatMessageSchema[] })[];
	}
}
