import { z } from "@infrastructure/config/zod-i18n.config";
import { conversationSchema } from "../schemas/conversation.schema";

// DTO para crear una conversación (público)
// Solo requiere visitor_id y title según rules-endpoints.md 16.1
export const conversationStoreDto = conversationSchema.pick({
	title: true,
	visitor_id: true,
});

export type ConversationStoreDto = z.infer<typeof conversationStoreDto>;
