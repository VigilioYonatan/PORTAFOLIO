import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { conversationQueryDto } from "./dtos/chat.class.dto";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ConversationQueryClassDto } from "./dtos/chat.class.dto";
import {
	ChatMessageIndexResponseClassDto,
	ConversationIndexResponseClassDto,
} from "./dtos/chat.response.class.dto";
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
		@Query(new ZodQueryPipe(conversationQueryDto))
		query: ConversationQueryClassDto,
	): Promise<ConversationIndexResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		const result = await this.chatService.index(tenant_id, query);
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
