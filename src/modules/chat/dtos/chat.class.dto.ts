import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { createZodDto } from "nestjs-zod";
import { chatMessageSchema } from "../schemas/chat-message.schema";
import { conversationSchema } from "../schemas/conversation.schema";

export const conversationStoreDto = conversationSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type ConversationStoreDto = z.infer<typeof conversationStoreDto>;

export const chatMessageStoreDto = chatMessageSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export type ChatMessageStoreDto = z.infer<typeof chatMessageStoreDto>;

export const conversationQueryDto = conversationSchema
	.pick({
		mode: true,
		is_active: true,
		visitor_id: true,
	})
	.partial()
	.extend(querySchema.shape);

export type ConversationQueryDto = z.infer<typeof conversationQueryDto>;

export const conversationIndexResponseDto =
	createPaginatorSchema(conversationSchema);

export const chatMessagePublicStoreDto = chatMessageSchema.pick({
	content: true,
});

export type ChatMessagePublicStoreDto = z.infer<
	typeof chatMessagePublicStoreDto
>;

export class ChatMessagePublicStoreClassDto extends createZodDto(
	chatMessagePublicStoreDto,
) {}

export class ConversationStoreClassDto extends createZodDto(
	conversationStoreDto,
) {}
export class ChatMessageStoreClassDto extends createZodDto(
	chatMessageStoreDto,
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
	conversationIndexResponseDto,
) {}
