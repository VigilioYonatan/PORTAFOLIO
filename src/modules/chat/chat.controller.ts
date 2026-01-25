import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import type { PaginatorResult } from "@infrastructure/utils/server";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import {
	ChatMessagePublicStoreClassDto,
	ChatMessageResponseClassDto,
	ChatMessageStoreClassDto,
	ConversationQueryClassDto,
	ConversationResponseClassDto,
	ConversationStoreClassDto,
	chatMessagePublicStoreSchema,
	chatMessageStoreSchema,
	conversationStoreSchema,
} from "./dtos/chat.class.dto";
import {
	ChatMessageIndexResponseClassDto,
	ConversationIndexResponseClassDto,
} from "./dtos/chat.response.class.dto";
import { type ChatMessageSchema } from "./schemas/chat-message.schema";
import { type ConversationSchema } from "./schemas/conversation.schema";
import { ChatService } from "./services/chat.service";

@ApiTags("Chat & Community")
@UseGuards(AuthenticatedGuard)
@Controller("chat")
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Roles(1)
	@Get("/conversations")
	@ApiOperation({ summary: "Listar conversaciones (paginado)" })
	@ApiResponse({
		status: 200,
		type: ConversationIndexResponseClassDto,
	})
	async index(
		@Req() req: Request,
		@Query() query: ConversationQueryClassDto,
	): Promise<ConversationIndexResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		const result = await this.chatService.indexConversations(tenant_id, query);
		return result;
	}

	@Get("/conversations/:id/messages")
	@Roles(1)
	@ApiOperation({ summary: "Obtener mensajes de una conversación" })
	@ApiResponse({ status: 200, type: ChatMessageIndexResponseClassDto })
	async getMessages(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<ChatMessageIndexResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.chatService.getMessages(tenant_id, id);
	}
}
