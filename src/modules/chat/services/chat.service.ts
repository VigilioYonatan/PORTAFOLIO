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
import type { ChatMessageSchema } from "../schemas/chat-message.schema";
import { DocumentRepository } from "@modules/documents/repositories/document.repository";
import  { ConversationRepository } from "../repositories/conversation.repository";

@Injectable()
export class ChatService {
	private readonly logger = new Logger(ChatService.name);

	constructor(
		private readonly repository: ChatRepository,
		private readonly aiService: AiService,
		private readonly aiConfigService: AiConfigService,
		private readonly conversationRepository: ConversationRepository,
		private readonly documentRepository: DocumentRepository,
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
		await this.showConversation(tenant_id, conversation_id);

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
		this.logger.log({ tenant_id, conversation_id }, "Starting AI stream with RAG");

		// 1. Context: Conversation & Messages
		await this.showConversation(tenant_id, conversation_id);
		const messages = await this.repository.getMessages(conversation_id);

		// 2. AI Config
		const { config } = await this.aiConfigService.show(tenant_id);

		// 3. RAG: Retrieve relevant context
		let contextText = "";
		const lastUserMessage = [...messages]
			.reverse()
			.find((m) => m.role === "USER");

		if (lastUserMessage) {
			try {
				this.logger.debug(
					{ query: lastUserMessage.content },
					"Generating embedding for RAG",
				);
				const embedding = await this.aiService.getEmbeddings(
					lastUserMessage.content,
				);
				const chunks = await this.documentRepository.findSimilarChunks(
					tenant_id,
					embedding,
					5,
				);

				if (chunks.length > 0) {
					this.logger.log(
						{ count: chunks.length },
						"Found relevant context chunks",
					);
					contextText = chunks
						.map((c) => `[Context ID:${c.id}]: ${c.content}`)
						.join("\n\n");
				}
			} catch (error) {
				this.logger.warn("RAG Retrieval Failed (proceeding without context)", error);
			}
		}

		// 4. Construct System Prompt with Context
		const baseSystemPrompt =
			config?.system_prompt ||
			"You are a Senior AI Assistant for a Portfolio. Be professional and concise.";

		const systemPrompt = `
${baseSystemPrompt}

==================================================
KNOWLEDGE BASE (CONTEXT)
==================================================
Use the following information from the user's portfolio/CV to answer the question.
If the answer is explicitly found in the context below, use it.
If the answer is NOT found in the context, use your general knowledge and logic, but act as the candidate.

${contextText ? contextText : "No specific context found for this query."}
==================================================
`;

		// 5. Format History for OpenAI
		const history = messages.slice(-10).map((msg) => ({
			role: msg.role.toLowerCase() as "user" | "assistant" | "system",
			content: msg.content,
		}));

		// 6. Call AI Service
		return await this.aiService.generateStream({
			model: config?.chat_model || "gpt-4o-mini",
			temperature: config?.temperature ?? 0.7,
			system: systemPrompt,
			messages: history,
		});
	}

	async showConversation(
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


	async storeConversation(
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
