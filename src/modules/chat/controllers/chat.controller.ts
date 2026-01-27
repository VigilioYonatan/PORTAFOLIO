import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Query,
	Req,
	Sse,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "@modules/auth/decorators/public.decorator";
import type { Observable } from "rxjs";
import { ChatMessagePublicStoreClassDto, chatMessagePublicStoreDto, ConversationQueryClassDto, conversationQueryDto, ConversationStoreClassDto, type ChatMessagePublicStoreDto, type ConversationStoreDto } from "../dtos/chat.class.dto";
import { ChatMessageIndexResponseClassDto, ChatMessagePublicStoreResponseClassDto, ConversationIndexResponseClassDto, ConversationStoreResponseClassDto } from "../dtos/chat.response.class.dto";
import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import  { ChatService } from "../services/chat.service";
import { conversationStoreDto } from "../dtos/conversation.store.dto";

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

	/**
	 * 16.1 Iniciar conversación (Público)
	 * Crea una nueva sesión de chat para un visitante anónimo
	 */
	@Public()
	@HttpCode(201)
	@Post("/conversations")
	@ApiOperation({ summary: "Iniciar nueva conversación (visitante)" })
	@ApiBody({ type: ConversationStoreClassDto })
	@ApiResponse({ type: ConversationStoreResponseClassDto })
	store(
		@Req() req: Request,
		@Body(new ZodPipe(conversationStoreDto)) body: ConversationStoreDto,
	): Promise<ConversationStoreResponseClassDto> {
		const ip_address =
			(req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
			req.socket.remoteAddress ||
			"";
		return this.chatService.storeConversation(
			req.locals.tenant.id,
			body,
			ip_address,
		);
	}

	/**
	 * 18.1 Enviar mensaje (Público)
	 * Registra y envía un mensaje del usuario hacia el servicio de Chat AI
	 */
	@Public()
	@HttpCode(201)
	@Post("/conversations/:id/messages")
	@ApiOperation({ summary: "Enviar mensaje a la conversación (visitante)" })
	@ApiBody({ type: ChatMessagePublicStoreClassDto })
	@ApiResponse({ type: ChatMessagePublicStoreResponseClassDto })
	storeMessage(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(chatMessagePublicStoreDto))
		body: ChatMessagePublicStoreDto,
	): Promise<ChatMessagePublicStoreResponseClassDto> {
		return this.chatService.storeMessage(req.locals.tenant.id, id, body);
	}

	/**
	 * 18.2 Stream de respuesta IA (Público)
	 * Inicia un stream SSE para recibir la respuesta generada por la IA
	 */
	@Public()
	@Sse("/conversations/:id/stream")
	@ApiOperation({ summary: "Stream de respuesta IA (SSE)" })
	stream(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<Observable<any>> {
		return this.chatService.streamMessage(req.locals.tenant.id, id);
	}
}
