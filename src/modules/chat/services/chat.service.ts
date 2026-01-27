import { sanitizeInput } from "@infrastructure/utils/hybrid/ai.utils";
import { paginator } from "@infrastructure/utils/server";
import { AiService } from "@modules/ai/services/ai.service";
import { AiConfigService } from "@modules/ai/services/ai-config.service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Observable } from "rxjs";
import type {
	ChatMessagePublicStoreDto,
	ChatMessageStoreDto,
	ConversationQueryDto,
	ConversationStoreDto,
} from "../dtos/chat.class.dto";
import type {
	ChatMessageIndexResponseDto,
	ChatMessagePublicStoreResponseDto,
	ConversationIndexResponseDto,
	ConversationStoreResponseDto,
} from "../dtos/chat.response.dto";
import { ChatRepository } from "../repositories/chat.repository";
import { type ConversationSchema } from "../schemas/conversation.schema";
import { ChatCache } from "../caches/chat.cache";

@Injectable()
export class ChatService {
	private readonly logger = new Logger(ChatService.name);

	constructor(
		private readonly repository: ChatRepository,
		private readonly aiService: AiService,
		private readonly aiConfigService: AiConfigService,
		private readonly cache: ChatCache,
	) {}

	async index(
		tenant_id: number,
		query: ConversationQueryDto,
	): Promise<ConversationIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing conversations");

		return await paginator<ConversationQueryDto, ConversationSchema>(
			"/chat/conversations",
			{
				filters: query,
				cb: async (filters, isClean) => {
					// If clean query, try cache first
					if (isClean) {
						const cached = await this.cache.getList(tenant_id, filters);
						if (cached) return cached;
					}

					const result = await this.repository.indexConversations(tenant_id, filters);

					if (isClean) {
						await this.cache.setList(tenant_id, filters, result);
					}

					return result;
				},
			},
		);
	}

	async store(
		tenant_id: number,
		body: ConversationStoreDto,
	): Promise<ConversationStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating conversation");
		const conversation = await this.repository.storeConversation(
			tenant_id,
			body,
		);
		await this.cache.invalidateLists(tenant_id);
		return { success: true, conversation };
	}

	async storeMessage(
		tenant_id: number,
		conversation_id: number,
		body: ChatMessagePublicStoreDto,
	): Promise<ChatMessagePublicStoreResponseDto> {
		this.logger.log({ tenant_id, conversation_id }, "Creating chat message");

		// 1. Verify conversation exists and belongs to tenant
		await this.show(tenant_id, conversation_id);

		// 2. Create message object with sanitized content
		const sanitizedContent = sanitizeInput(body.content);

		const messagePayload: ChatMessageStoreDto = {
			tenant_id,
			conversation_id,
			content: sanitizedContent,
			role: "USER",
			is_read: false,
			sources: [],
		};

		const message = await this.repository.storeMessage(
			tenant_id,
			messagePayload,
		);
		await this.cache.invalidateLists(tenant_id);
		return { success: true, message };
	}

	async getMessages(
		tenant_id: number,
		conversation_id: number,
	): Promise<ChatMessageIndexResponseDto> {
		this.logger.log({ tenant_id, conversation_id }, "Listing chat messages");

		const conversation = await this.repository.showConversation(
			tenant_id,
			conversation_id,
		);
		if (!conversation) {
			this.logger.warn(
				{ tenant_id, conversation_id },
				"Conversation not found for messages",
			);
			throw new NotFoundException(`Conversation #${conversation_id} not found`);
		}

		const messages = await this.repository.getMessages(conversation_id);
		return { success: true, messages };
	}

	async streamMessage(
		tenant_id: number,
		conversation_id: number,
	): Promise<Observable<{ data: { content: string } }>> {
		this.logger.log({ tenant_id, conversation_id }, "Starting AI stream");

		// 1. Context: Conversation & Messages
		await this.show(tenant_id, conversation_id);
		const messages = await this.repository.getMessages(conversation_id);

		// 2. AI Config
		const { config } = await this.aiConfigService.show(tenant_id);

		// 3. Format History for OpenAI
		// Take last 10 messages to save tokens (History Compression)
		const history = messages.slice(-10).map((msg) => ({
			role: msg.role.toLowerCase() as "user" | "assistant" | "system",
			content: msg.content,
		}));

		// 4. Call AI Service
		return await this.aiService.generateStream({
			model: config?.chat_model || "gpt-4o-mini", // Fallback
			temperature: config?.temperature ?? 0.7,
			system: config?.system_prompt || "Eres un asistente útil.",
			messages: history,
		});
	}

	async show(
		tenant_id: number,
		id: number,
	): Promise<ConversationSchema> {
		this.logger.log(
			{ tenant_id, id },
			"Fetching conversation detail (internal)",
		);
		const conversation = await this.repository.showConversation(tenant_id, id);
		if (!conversation) {
			this.logger.warn({ tenant_id, id }, "Conversation not found");
			throw new NotFoundException(`Conversation #${id} not found`);
		}
		return conversation;
	}
}
