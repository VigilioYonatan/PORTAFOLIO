import { createZodDto } from "nestjs-zod";
import {
	chatMessageIndexResponseDto,
	chatMessagePublicStoreResponseDto,
	conversationIndexResponseDto,
	conversationStoreResponseDto,
} from "./chat.response.dto";

export class ConversationIndexResponseClassDto extends createZodDto(
	conversationIndexResponseDto,
) {}
export class ConversationStoreResponseClassDto extends createZodDto(
	conversationStoreResponseDto,
) {}
export class ChatMessageIndexResponseClassDto extends createZodDto(
	chatMessageIndexResponseDto,
) {}
export class ChatMessagePublicStoreResponseClassDto extends createZodDto(
	chatMessagePublicStoreResponseDto,
) {}
