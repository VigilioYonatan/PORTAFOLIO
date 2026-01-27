import { formatTimeAgo } from "@infrastructure/utils/hybrid";
import { MessageSquareIcon, SendIcon, UserIcon } from "lucide-preact";
import { useSignal, useComputed, signal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { conversationIndexApi } from "../apis/conversation.index.api";
import type { ConversationSchema } from "../schemas/conversation.schema";
import type { JSX } from "preact/jsx-runtime";
import {
	connectChatSocket,
	disconnectChatSocket,
	getChatSocket,
	joinConversation,
	leaveConversation,
	onNewMessage,
	removeAllChatListeners,
	sendChatMessage,
	sendTypingStatus,
} from "../utils/client/chat.socket";

interface ChatMessageDisplay {
	id: number;
	content: string;
	role: "USER" | "ADMIN" | "ASSISTANT";
	created_at: string;
}

const TENANT_ID = 1;

// Shared state for selected conversation
export const selectedConversationId = signal<number | null>(null);
export const selectedConversationIp = signal<string>("");

export function ConversationList() {
	const { data, isLoading, isSuccess, isError, refetch } =
		conversationIndexApi(null, null, { grouped: true });

	// Listen for new conversations
	useEffect(() => {
		connectChatSocket();
		const socket = getChatSocket();
		socket.on("new_conversation", () => {
			refetch();
		});

		return () => {
			socket.off("new_conversation");
		};
	}, []);

	function handleSelectConversation(conv: ConversationSchema) {
		selectedConversationId.value = conv.id;
		selectedConversationIp.value = conv.ip_address;
	}

	let component: JSX.Element | null = null;

	if (isLoading) {
		component = (
			<div class="flex-1 flex items-center justify-center">
				<div class="animate-pulse text-muted-foreground text-sm">
					Loading sessions...
				</div>
			</div>
		);
	}

	if (isError) {
		component = (
			<div class="flex-1 flex items-center justify-center">
				<div class="text-destructive text-sm">Error loading sessions</div>
			</div>
		);
	}

	if (isSuccess) {
		const conversations = data?.results ?? [];

		component =
			conversations.length === 0 ? (
				<div class="p-4 text-center text-muted-foreground text-sm">
					No conversations yet
				</div>
			) : (
				<div class="max-h-full overflow-y-auto">
					{conversations.map((conv: ConversationSchema) => (
						<button
							type="button"
							key={conv.id}
							onClick={() => handleSelectConversation(conv)}
							class={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors relative group ${
								selectedConversationId.value === conv.id
									? "bg-primary/10 border-l-2 border-l-primary"
									: ""
							}`}
						>
							<div class="flex justify-between items-start mb-1">
								<span class="font-mono text-xs text-primary">
									{conv.ip_address}
								</span>
								<span class="text-[10px] text-muted-foreground">
									{formatTimeAgo(conv.updated_at)}
								</span>
							</div>
							<p class="text-[11px] truncate text-muted-foreground group-hover:text-foreground">
								{conv.title}
							</p>
							<div class="flex items-center gap-2 mt-1">
								{conv.is_active && (
									<span
										class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
										title="Live Now"
									/>
								)}
								<span class="text-[9px] px-1 bg-white/5 rounded text-muted-foreground">
									{conv.mode === "LIVE" ? "🧑 LIVE" : "🤖 AI"}
								</span>
							</div>
						</button>
					))}
				</div>
			);
	}

	return (
		<div class="border-r border-border h-full flex flex-col bg-card/50">
			<div class="p-4 border-b border-border">
				<h3 class="font-bold flex items-center gap-2">
					<MessageSquareIcon size={18} /> Sessions
				</h3>
			</div>
			<div class="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
				{component}
			</div>
		</div>
	);
}

export function ChatViewer() {
	const messages = useSignal<ChatMessageDisplay[]>([]);
	const inputValue = useSignal<string>("");
	const isLoading = useSignal<boolean>(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	const hasConversation = useComputed(
		() => selectedConversationId.value !== null,
	);

	// Load messages and connect to WebSocket
	useEffect(() => {
		const convId = selectedConversationId.value;
		if (!convId) return;

		// Load existing messages
		isLoading.value = true;
		fetch(`/api/v1/chat/conversations/${convId}/messages`)
			.then((res) => res.json())
			.then((data) => {
				if (data.messages) {
					messages.value = data.messages;
				}
				isLoading.value = false;
			})
			.catch(() => {
				isLoading.value = false;
			});

		// Connect to WebSocket
		connectChatSocket();
		joinConversation(convId, "admin", TENANT_ID);

		onNewMessage((msg) => {
			messages.value = [
				...messages.value,
				{
					id: msg.id,
					content: msg.content,
					role: msg.role,
					created_at: msg.created_at,
				},
			];
		});

		return () => {
			leaveConversation(convId);
			removeAllChatListeners();
		};
	}, [selectedConversationId.value]);

	// Auto-scroll
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages.value]);

	function handleSend() {
		const convId = selectedConversationId.value;
		if (!convId || !inputValue.value.trim()) return;

		sendChatMessage(convId, inputValue.value, "ADMIN", TENANT_ID);
		inputValue.value = "";
	}

	function handleTyping(typing: boolean) {
		const convId = selectedConversationId.value;
		if (convId) {
			sendTypingStatus(convId, typing);
		}
	}

	if (!hasConversation.value) {
		return (
			<div class="flex flex-col h-full bg-background/50">
				<div class="p-4 border-b border-border flex justify-between items-center">
					<div>
						<h3 class="font-bold">Session Viewer</h3>
						<span class="text-xs text-muted-foreground">
							Select a conversation
						</span>
					</div>
				</div>
				<div class="flex-1 p-8 flex items-center justify-center text-muted-foreground">
					<div class="text-center">
						<MessageSquareIcon size={48} class="mx-auto mb-4 opacity-50" />
						<p>Select a conversation to view history or intervene.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div class="flex flex-col h-full bg-background/50">
			{/* Header */}
			<div class="p-4 border-b border-border flex justify-between items-center">
				<div>
					<h3 class="font-bold font-mono">{selectedConversationIp.value}</h3>
					<span class="text-xs text-green-500">LIVE MODE ACTIVE</span>
				</div>
				<div class="text-xs text-muted-foreground">
					Conv #{selectedConversationId.value}
				</div>
			</div>

			{/* Messages */}
			<div
				ref={scrollRef}
				class="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
			>
				{isLoading.value ? (
					<div class="flex items-center justify-center h-full">
						<span class="animate-pulse text-muted-foreground">
							Loading messages...
						</span>
					</div>
				) : messages.value.length === 0 ? (
					<div class="flex items-center justify-center h-full text-muted-foreground">
						No messages yet
					</div>
				) : (
					messages.value.map((msg) => (
						<div
							key={msg.id}
							class={`flex flex-col gap-1 max-w-[80%] ${
								msg.role === "USER" ? "self-start" : "self-end items-end"
							}`}
						>
							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<UserIcon size={12} />
								<span>
									{msg.role === "USER"
										? "Visitor"
										: msg.role === "ADMIN"
											? "You"
											: "AI"}
								</span>
								<span>{formatTimeAgo(msg.created_at)}</span>
							</div>
							<div
								class={`p-3 rounded-lg text-sm ${
									msg.role === "USER"
										? "bg-zinc-800 text-white"
										: msg.role === "ADMIN"
											? "bg-primary text-black"
											: "bg-blue-500/20 text-blue-300"
								}`}
							>
								{msg.content}
							</div>
						</div>
					))
				)}
			</div>

			{/* Input */}
			<div class="p-4 border-t border-border">
				<div class="flex gap-2">
					<input
						type="text"
						class="flex-1 bg-zinc-900 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-primary"
						placeholder="Type your response..."
						value={inputValue.value}
						onInput={(e) => {
							inputValue.value = e.currentTarget.value;
							handleTyping(true);
						}}
						onBlur={() => handleTyping(false)}
						onKeyDown={(e) => e.key === "Enter" && handleSend()}
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={!inputValue.value.trim()}
						class="bg-primary text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<SendIcon size={16} />
						Send
					</button>
				</div>
			</div>
		</div>
	);
}
