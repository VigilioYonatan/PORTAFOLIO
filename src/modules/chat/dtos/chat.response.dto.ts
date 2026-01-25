import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { chatMessageSchema } from "../schemas/chat-message.schema";
import { conversationSchema } from "../schemas/conversation.schema";

// --- Conversation ---

export const conversationIndexResponseDto =
	createPaginatorSchema(conversationSchema);
export type ConversationIndexResponseDto = z.infer<
	typeof conversationIndexResponseDto
>;

export const conversationStoreResponseDto = z.object({
	success: z.literal(true),
	conversation: conversationSchema,
});
export type ConversationStoreResponseDto = z.infer<
	typeof conversationStoreResponseDto
>;

// --- Message ---

export const chatMessageIndexResponseDto = z.object({
	success: z.literal(true),
	messages: z.array(chatMessageSchema),
});
export type ChatMessageIndexResponseDto = z.infer<
	typeof chatMessageIndexResponseDto
>;

export const chatMessagePublicStoreResponseDto = z.object({
	success: z.literal(true),
	message: chatMessageSchema,
});
export type ChatMessagePublicStoreResponseDto = z.infer<
	typeof chatMessagePublicStoreResponseDto
>;
