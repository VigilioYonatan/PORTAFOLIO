import { Injectable, Logger } from "@nestjs/common";
import type { ConversationStoreResponseDto } from "../dtos/chat.response.dto";
import type { ConversationStoreDto } from "../dtos/conversation.store.dto";
import { ConversationRepository } from "../repositories/conversation.repository";
import type { ChatMessageSchema } from "../schemas/chat-message.schema";
import type { ConversationSchema } from "../schemas/conversation.schema";

@Injectable()
export class ConversationService {
	private readonly logger = new Logger(ConversationService.name);

	constructor(
		private readonly conversationRepository: ConversationRepository,
	) {}

	async store(
		tenant_id: number,
		body: ConversationStoreDto,
		ip_address: string,
	): Promise<ConversationStoreResponseDto> {
		this.logger.log(
			{ tenant_id, ip_address },
			"Creating conversation via Chatbot",
		);

		const conversation = await this.conversationRepository.store(tenant_id, {
			...body,
			ip_address,
			mode: "AI",
			is_active: true,
			title: body.title || "New Conversation",
			user_id: null,
		});

		return { success: true, conversation };
	}

	/**
	 * Internal lookup for AI analysis pipeline
	 */
	async getRecentForAnalysis(
		tenant_id: number,
		limit_count = 100,
	): Promise<(ConversationSchema & { messages: ChatMessageSchema[] })[]> {
		this.logger.log(
			{ tenant_id, limit_count },
			"Fetching recent conversations for analysis",
		);
		return this.conversationRepository.indexRecentForAnalysis(
			tenant_id,
			limit_count,
		);
	}
}
