import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { createZodDto } from "nestjs-zod";
import { chatMessageSchema } from "../schemas/chat-message.schema";
import { conversationSchema } from "../schemas/conversation.schema";

export const conversationStoreSchema = conversationSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type ConversationStoreDto = z.infer<typeof conversationStoreSchema>;

export const chatMessageStoreSchema = chatMessageSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export type ChatMessageStoreDto = z.infer<typeof chatMessageStoreSchema>;

export const conversationQueryDto = conversationSchema
	.pick({
		mode: true,
		is_active: true,
		visitor_id: true,
	})
	.partial()
	.extend(querySchema.shape);

export type ConversationQueryDto = z.infer<typeof conversationQueryDto>;

export const conversationIndexResponseSchema =
	createPaginatorSchema(conversationSchema);

export const chatMessagePublicStoreSchema = chatMessageSchema.pick({
	content: true,
});

export type ChatMessagePublicStoreDto = z.infer<
	typeof chatMessagePublicStoreSchema
>;

export class ChatMessagePublicStoreClassDto extends createZodDto(
	chatMessagePublicStoreSchema,
) {}

export class ConversationStoreClassDto extends createZodDto(
	conversationStoreSchema,
) {}
export class ChatMessageStoreClassDto extends createZodDto(
	chatMessageStoreSchema,
) {}
export class ConversationQueryClassDto extends createZodDto(
	conversationQueryDto,
) {}
export class ConversationResponseClassDto extends createZodDto(
	conversationSchema,
) {}
export class ChatMessageResponseClassDto extends createZodDto(
	chatMessageSchema,
) {}
export class ConversationIndexResponseClassDto extends createZodDto(
	conversationIndexResponseSchema,
) {}
