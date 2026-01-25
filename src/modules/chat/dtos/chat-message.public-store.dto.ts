import { z } from "@infrastructure/config/zod-i18n.config";
import { chatMessageSchema } from "../schemas/chat-message.schema";

// DTO público para crear un mensaje de chat (18.1)
// Solo requiere content según rules-endpoints.md
export const chatMessagePublicStoreDto = chatMessageSchema.pick({
	content: true,
});

export type ChatMessagePublicStoreDto = z.infer<
	typeof chatMessagePublicStoreDto
>;
