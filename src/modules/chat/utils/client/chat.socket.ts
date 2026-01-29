import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import type { ChatMessageSchema } from "../../schemas/chat-message.schema";

export type ChatMode = "AI" | "LIVE";

// Use Pick from schema to inherit role type
export type ChatMessage = Pick<
	ChatMessageSchema,
	"id" | "content" | "role" | "created_at"
>;

export interface ChatSocketEvents {
	new_message: (message: ChatMessage) => void;
	mode_changed: (data: { mode: ChatMode }) => void;
	typing_status: (data: { is_typing: boolean }) => void;
	new_conversation: (data: {
		tenant_id: number;
		conversation: unknown;
	}) => void;
}

let socket: Socket | null = null;

/**
 * Get or create the chat socket connection
 */
export function getChatSocket(): Socket {
	if (!socket) {
		const wsUrl =
			typeof window !== "undefined"
				? `${window.location.protocol}//${window.location.host}/chat`
				: "http://localhost:4321/chat";

		socket = io(wsUrl, {
			transports: ["websocket", "polling"],
			autoConnect: false,
		});
	}
	return socket;
}

/**
 * Connect to the chat socket
 */
export function connectChatSocket(): void {
	const s = getChatSocket();
	if (!s.connected) {
		s.connect();
	}
}

/**
 * Disconnect from the chat socket
 */
export function disconnectChatSocket(): void {
	if (socket?.connected) {
		socket.disconnect();
	}
}

/**
 * Join a conversation room
 */
export function joinConversation(
	conversation_id: number,
	visitor_id: string,
	tenant_id: number,
	mode?: ChatMode,
): void {
	const s = getChatSocket();
	s.emit("join_conversation", {
		conversation_id,
		visitor_id,
		tenant_id,
		mode,
	});
}

/**
 * Leave a conversation room
 */
export function leaveConversation(conversation_id: number): void {
	const s = getChatSocket();
	s.emit("leave_conversation", { conversation_id });
}

/**
 * Send a message via WebSocket
 */
export function sendChatMessage(
	conversation_id: number,
	content: string,
	role: ChatMessageSchema["role"],
	tenant_id: number,
): void {
	const s = getChatSocket();
	s.emit("send_message", { conversation_id, content, role, tenant_id });
}

/**
 * Send typing indicator
 */
export function sendTypingStatus(
	conversation_id: number,
	is_typing: boolean,
): void {
	const s = getChatSocket();
	s.emit("admin_typing", { conversation_id, is_typing });
}

/**
 * Subscribe to new messages
 */
export function onNewMessage(callback: ChatSocketEvents["new_message"]): void {
	const s = getChatSocket();
	s.on("new_message", callback);
}

/**
 * Subscribe to mode changes
 */
export function onModeChanged(
	callback: ChatSocketEvents["mode_changed"],
): void {
	const s = getChatSocket();
	s.on("mode_changed", callback);
}

/**
 * Subscribe to typing status
 */
export function onTypingStatus(
	callback: ChatSocketEvents["typing_status"],
): void {
	const s = getChatSocket();
	s.on("typing_status", callback);
}

/**
 * Remove all listeners
 */
export function removeAllChatListeners(): void {
	const s = getChatSocket();
	s.removeAllListeners();
}
