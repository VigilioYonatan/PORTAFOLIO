import { createZodDto } from "nestjs-zod";
import { chatMessagePublicStoreDto } from "./chat-message.public-store.dto";

export class ChatMessagePublicStoreClassDto extends createZodDto(
	chatMessagePublicStoreDto,
) {}
