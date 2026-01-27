import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import type { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import type { Server, Socket } from "socket.io";
import { ChatService } from "../services/chat.service";
import { ChatRepository } from "../repositories/chat.repository";
import type { ChatMessageStoreDto } from "../dtos/chat.class.dto";

interface JoinPayload {
	conversation_id: number;
	visitor_id: string;
	tenant_id: number;
	mode?: "AI" | "LIVE";
}

interface MessagePayload {
	conversation_id: number;
	content: string;
	role: "USER" | "ADMIN";
	tenant_id: number;
}

@WebSocketGateway({
	cors: {
		origin: "*",
		credentials: true,
	},
	namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(ChatGateway.name);
	private readonly connections = new Map<string, Socket>();

	constructor(
		private readonly chatService: ChatService,
		private readonly chatRepository: ChatRepository,
	) {}

	handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
		this.connections.set(client.id, client);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		this.connections.delete(client.id);
	}

	@SubscribeMessage("join_conversation")
	async handleJoinConversation(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: JoinPayload,
	) {
		const room = `conversation_${payload.conversation_id}`;
		client.join(room);
		this.logger.log(
			`Client ${client.id} joined room ${room}`,
		);

		// If admin joins OR user explicitly requests LIVE mode
		if (payload.visitor_id === "admin" || payload.mode === "LIVE") {
			const mode = "LIVE";
			await this.chatRepository.updateConversationMode(
				payload.tenant_id,
				payload.conversation_id,
				mode,
			);
			this.server.to(room).emit("mode_changed", { mode });
			
			// Notify admins about the active conversation/mode change
			this.notifyNewConversation(payload.tenant_id, { 
				id: payload.conversation_id, 
				mode 
			});
		}

		return { success: true, room };
	}

	@SubscribeMessage("leave_conversation")
	handleLeaveConversation(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { conversation_id: number },
	) {
		const room = `conversation_${payload.conversation_id}`;
		client.leave(room);
		this.logger.log(`Client ${client.id} left room ${room}`);
		return { success: true };
	}

	@SubscribeMessage("send_message")
	async handleSendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: MessagePayload,
	) {
		this.logger.log(
			{ conversation_id: payload.conversation_id, role: payload.role },
			"Message received via WebSocket",
		);

		const room = `conversation_${payload.conversation_id}`;

		// Store message in database
		const messageData: ChatMessageStoreDto = {
			tenant_id: payload.tenant_id,
			conversation_id: payload.conversation_id,
			content: payload.content,
			role: payload.role,
			is_read: false,
			sources: [],
		};

		const message = await this.chatRepository.storeMessage(
			payload.tenant_id,
			messageData,
		);

		// Broadcast to all clients in the room
		this.server.to(room).emit("new_message", {
			id: message.id,
			content: message.content,
			role: message.role,
			created_at: message.created_at,
		});

		return { success: true, message_id: message.id };
	}

	@SubscribeMessage("admin_typing")
	handleAdminTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { conversation_id: number; is_typing: boolean },
	) {
		const room = `conversation_${payload.conversation_id}`;
		client.to(room).emit("typing_status", { is_typing: payload.is_typing });
		return { success: true };
	}

	/**
	 * Notify all admins about a new conversation (for dashboard)
	 */
	notifyNewConversation(tenant_id: number, conversation: unknown) {
		this.server.emit("new_conversation", { tenant_id, conversation });
	}
}
