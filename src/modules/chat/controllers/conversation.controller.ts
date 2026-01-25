import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import {
	Body,
	Controller,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Sse,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import type { Observable } from "rxjs";
import {
	ChatMessagePublicStoreResponseClassDto,
	ConversationStoreResponseClassDto,
} from "../dtos/chat.response.class.dto";
import { ChatMessagePublicStoreClassDto } from "../dtos/chat-message.public-store.class.dto";
import {
	type ChatMessagePublicStoreDto,
	chatMessagePublicStoreDto,
} from "../dtos/chat-message.public-store.dto";
import { ConversationStoreClassDto } from "../dtos/conversation.store.class.dto";
import {
	type ConversationStoreDto,
	conversationStoreDto,
} from "../dtos/conversation.store.dto";
import { type ChatMessageSchema } from "../schemas/chat-message.schema";
import { type ConversationSchema } from "../schemas/conversation.schema";
import { ChatService } from "../services/chat.service";
import { ConversationService } from "../services/conversation.service";

@ApiTags("Conversations")
@Controller("conversations")
export class ConversationController {
	constructor(
		private readonly conversationService: ConversationService,
		private readonly chatService: ChatService,
	) {}

	/**
	 * 16.1 Iniciar conversación (Público)
	 * Crea una nueva sesión de chat para un visitante anónimo
	 */
	@Public()
	@HttpCode(201)
	@Post("/")
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
		return this.conversationService.store(
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
	@Post("/:id/messages")
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
	@Sse("/:id/stream")
	@ApiOperation({ summary: "Stream de respuesta IA (SSE)" })
	stream(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<Observable<{ data: { content: string } }>> {
		return this.chatService.streamMessage(req.locals.tenant.id, id);
	}
}
