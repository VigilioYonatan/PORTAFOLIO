import { createZodDto } from "nestjs-zod";
import { conversationStoreDto } from "./conversation.store.dto";

export class ConversationStoreClassDto extends createZodDto(
	conversationStoreDto,
) {}
