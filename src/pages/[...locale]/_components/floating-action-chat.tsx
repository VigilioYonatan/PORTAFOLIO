import { cn } from "@infrastructure/utils/client";
import { chatMessagePublicStoreApi } from "@modules/chat/apis/chat-message.public-store.api";
import { conversationStoreApi } from "@modules/chat/apis/conversation.store.api";
import type { ChatMessageSchema } from "@modules/chat/schemas/chat-message.schema";
import {
	type ChatMode,
	connectChatSocket,
	disconnectChatSocket,
	getChatSocket,
	joinConversation,
	onModeChanged,
	onNewMessage,
	removeAllChatListeners,
	sendChatMessage,
} from "@modules/chat/utils/client/chat.socket";
import { useSignal } from "@preact/signals";
import { isChatOpen } from "@stores/chat.store";
import {
	BotIcon,
	BuildingIcon,
	ChevronRightIcon,
	SendIcon,
	TerminalIcon,
	UserIcon,
	WifiIcon,
	WifiOffIcon,
	XIcon,
} from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

interface ChatMessage {
	role: ChatMessageSchema["role"];
	content: string;
	isStreaming?: boolean;
}

const TENANT_ID = 1; // Default tenant

export default function FloatingActionChat() {
	// Direct signal usage for better reactivity
	const modeSelected = useSignal<boolean>(false);
	const conversationId = useSignal<number | null>(null);
	const chatMode = useSignal<ChatMode>("AI");
	const messages = useSignal<ChatMessage[]>([]);
	const inputValue = useSignal<string>("");
	const isTyping = useSignal<boolean>(false);
	const isAdminTyping = useSignal<boolean>(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Lead Capture Signals
	const visitorName = useSignal<string>("");
	const visitorCompany = useSignal<string>("");
	const isVerified = useSignal<boolean>(false); // True if user passed the form

	// Initialize from LocalStorage
	useEffect(() => {
		const storedName = localStorage.getItem("chat_visitor_name");
		const storedCompany = localStorage.getItem("chat_visitor_company");
		if (storedName) {
			visitorName.value = storedName;
			visitorCompany.value = storedCompany || "";
			isVerified.value = true;
		}
	}, []);

	// Auto-select mode if already in a conversation
	useEffect(() => {
		if (conversationId.value && !modeSelected.value) {
			modeSelected.value = true;
			if (messages.value.length === 0) {
				const greeting = visitorCompany.value
					? `AI_LINK_REESTABLISHED: Welcome back, ${visitorName.value}. How can I assist ${visitorCompany.value} today?`
					: `AI_LINK_REESTABLISHED: Welcome back, ${visitorName.value}. Protocol active.`;

				messages.value = [
					{
						role: "ASSISTANT",
						content:
							chatMode.value === "AI"
								? greeting
								: "HUMAN_LINK_REESTABLISHED: Connection restored.",
					},
				];
			}
		}
	}, [conversationId.value]);

	const startConversationMutation = conversationStoreApi();
	const sendMessageMutation = chatMessagePublicStoreApi(conversationId);

	// Helper to ensure valid UUID
	function getValidVisitorId() {
		let vid = localStorage.getItem("chat_visitor_id");
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

		if (!vid || !uuidRegex.test(vid)) {
			vid = crypto.randomUUID();
			localStorage.setItem("chat_visitor_id", vid);
		}
		return vid;
	}

	// Socket connection for LIVE mode
	useEffect(() => {
		if (chatMode.value === "LIVE" && conversationId.value) {
			connectChatSocket();
			const visitorId = getValidVisitorId();
			joinConversation(conversationId.value, visitorId, TENANT_ID, "LIVE");

			onNewMessage((msg: ChatMessage) => {
				messages.value = [
					...messages.value,
					{
						role: msg.role === "ADMIN" ? "ADMIN" : "ASSISTANT",
						content: msg.content,
					},
				];
			});

			onModeChanged((data: { mode: ChatMode }) => {
				if (data.mode === "LIVE") {
					messages.value = [
						...messages.value,
						{
							role: "ASSISTANT",
							content:
								"SENIOR_MODE_ACTIVATED: A human architect has joined the conversation.",
						},
					];
				}
			});

			const socket = getChatSocket();
			socket.on("typing_status", (data: { is_typing: boolean }) => {
				isAdminTyping.value = data.is_typing;
			});

			return () => {
				removeAllChatListeners();
				disconnectChatSocket();
			};
		}
	}, [chatMode.value, conversationId.value]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages.value, isChatOpen.value, isTyping.value]);

	function handleModeSwitch(mode: ChatMode) {
		if (chatMode.value === mode) return;
		chatMode.value = mode;

		if (mode === "LIVE") {
			messages.value = [
				...messages.value,
				{
					role: "ASSISTANT",
					content:
						"SWITCHING_TO_SENIOR_MODE: Connecting to human architect... Please wait.",
				},
			];
		} else {
			messages.value = [
				...messages.value,
				{
					role: "ASSISTANT",
					content: "SWITCHING_TO_AI_MODE: AI Nexus re-engaged. How can I help?",
				},
			];
		}
	}

	function handleVerification() {
		if (!visitorName.value.trim()) return;
		localStorage.setItem("chat_visitor_name", visitorName.value);
		localStorage.setItem("chat_visitor_company", visitorCompany.value);
		isVerified.value = true;
		
		// Set personalized greeting immediately after verification
		if (!conversationId.value && messages.value.length === 0) {
            const name = visitorName.value.split(" ")[0]; // First name
            const company = visitorCompany.value;
            
            const greeting = company
                ? `AI_LINK_ESTABLISHED: Hello ${name}. It is a pleasure to connect with ${company}. How can I assist you professionally today?`
                : `AI_LINK_ESTABLISHED: Hello ${name}. The system is online. How can I assist you professionally today?`;

			messages.value = [
				{
					role: "ASSISTANT",
					content: greeting,
				},
			];
            modeSelected.value = true;
            chatMode.value = "AI";
		}
	}

	async function handleSend() {
		if (!inputValue.value.trim() || isTyping.value) return;

		// 30 Message limit
		if (messages.value.filter((m) => m.role === "USER").length >= 30) {
			messages.value = [
				...messages.value,
				{
					role: "ASSISTANT",
					content: "ERROR: MESSAGE_LIMIT_REACHED. Connection terminated.",
				},
			];
			return;
		}

		let userText = inputValue.value;
		inputValue.value = "";

		// Ensure conversation is started
		const wasNewConversation = !conversationId.value;
		let validConversationId = conversationId.value;

		if (!validConversationId) {
			try {
				// Generate simple visitor ID if not exists
				const visitorId = getValidVisitorId();

				const title = visitorCompany.value
					? `${visitorName.value} @ ${visitorCompany.value}`
					: `${visitorName.value} (Guest)`;

				const session = await startConversationMutation.mutateAsync({
					title: title,
					visitor_id: visitorId,
				});

				if (session?.conversation?.id) {
					// INJECT CONTEXT ON FIRST MESSAGE
					// We prepend this invisible context so the AI knows who it's talking to
					userText = `[SYSTEM_CONTEXT: User is "${visitorName.value}" from "${visitorCompany.value || "Unknown Company"}". Your goal is to professionally sell Yonatan's services tailored to their potential needs. Be persuasive but subtle.]\n\n${userText}`;

					validConversationId = session.conversation.id;
					conversationId.value = validConversationId;
				} else {
					throw new Error("Invalid session response");
				}
			} catch (_err) {
				messages.value = [
					...messages.value,
					{
						role: "ASSISTANT",
						content: "ERROR: NEURAL_LINK_ESTABLISHMENT_FAILED. RETRY_LATER.",
					},
				];
				return;
			}
		}

		// Add user message (Show original text only to user, hidden context is sent to API)
		const displayContent = userText.includes("[SYSTEM_CONTEXT:")
			? userText.split("]\n\n")[1] || userText
			: userText;

		messages.value = [
			...messages.value,
			{ role: "USER", content: displayContent },
		];
		isTyping.value = true;

		// LIVE mode: send via WebSocket
		if (chatMode.value === "LIVE") {
			sendChatMessage(validConversationId, userText, "USER", TENANT_ID);
			isTyping.value = false;
			return;
		}

		// AI mode: send via HTTP + SSE
		try {
			if (wasNewConversation) {
				const res = await fetch(
					`/api/v1/chat/conversations/${validConversationId}/messages`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ content: userText }),
					},
				);
				if (!res.ok) throw await res.json();
			} else {
				await sendMessageMutation.mutateAsync({ content: userText });
			}

			// Start SSE for real-time AI response
			const eventSource = new EventSource(
				`/api/v1/chat/conversations/${validConversationId}/stream`,
			);

			// Initial placeholder for streaming response
			const streamingMsgIndex = messages.value.length;
			messages.value = [
				...messages.value,
				{ role: "ASSISTANT", content: "", isStreaming: true },
			];

			eventSource.onmessage = (event) => {
				const data = JSON.parse(event.data);

				if (data.content || data.type === "chunk") {
					const currentMessages = [...messages.value];
					if (currentMessages[streamingMsgIndex]) {
						currentMessages[streamingMsgIndex] = {
							...currentMessages[streamingMsgIndex],
							content:
								currentMessages[streamingMsgIndex].content +
								(data.content || ""),
						};
						messages.value = currentMessages;
					}
				}

				if (data.type === "done" || data.type === "error") {
					const currentMessages = [...messages.value];
					if (currentMessages[streamingMsgIndex]) {
						currentMessages[streamingMsgIndex] = {
							...currentMessages[streamingMsgIndex],
							isStreaming: false,
						};
						messages.value = currentMessages;
					}
					isTyping.value = false;
					eventSource.close();
				}
			};

			eventSource.onerror = (_err) => {
				const currentMessages = [...messages.value];
				if (
					currentMessages[streamingMsgIndex] &&
					!currentMessages[streamingMsgIndex].content
				) {
					currentMessages[streamingMsgIndex] = {
						role: "ASSISTANT",
						content: "ERROR: SIGNAL_INTERRUPTED. RE-ALIGNING SENSORS...",
						isStreaming: false,
					};
				} else if (currentMessages[streamingMsgIndex]) {
					currentMessages[streamingMsgIndex].isStreaming = false;
				}
				messages.value = currentMessages;
				isTyping.value = false;
				eventSource.close();
			};
		} catch (_err) {
			messages.value = [
				...messages.value,
				{
					role: "ASSISTANT",
					content: "ERROR: TRANSMISSION_TIMEOUT. SIGNAL_LOST.",
				},
			];
			isTyping.value = false;
		}
	}

	return (
		<>
			{/* The Terminal Window */}
			<div
				class={cn(
					"fixed bottom-40 right-6 z-50 w-[380px] md:w-[420px] h-[550px] bg-zinc-950/95 border border-primary/20 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) origin-bottom-right overflow-hidden backdrop-blur-xl",
					isChatOpen.value
						? "opacity-100 scale-100 translate-y-0 translate-x-0"
						: "opacity-0 scale-90 translate-y-4 translate-x-full pointer-events-none",
				)}
			>
				{/* Visual Artifacts */}
				<div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />

				{/* Header Terminal Style */}
				<div class="p-4 bg-zinc-950/60 border-b border-primary/10 flex items-center justify-between relative">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-primary relative group">
							<div class="absolute inset-0 bg-primary/20 animate-pulse opacity-0 group-hover:opacity-100" />
							<TerminalIcon size={16} />
						</div>
						<div class="flex flex-col">
							<h4 class="font-black text-[10px] tracking-[0.3em] uppercase text-white">
								{chatMode.value === "AI" ? "AI_NEXUS_v2.0.4" : "SENIOR_MODE"}
							</h4>
							<span class="text-[8px] text-primary/80 flex items-center gap-1 font-bold tracking-widest uppercase">
								{conversationId.value ? (
									<WifiIcon size={8} class="text-green-500" />
								) : (
									<WifiOffIcon size={8} class="text-yellow-500" />
								)}
								{visitorName.value
									? `LINKED: ${visitorName.value.split(" ")[0]}`.toUpperCase()
									: "UNIDENTIFIED_USER"}
							</span>
						</div>
					</div>
					{/* Mode Toggle Buttons - Only visible after verification */}
					{modeSelected.value && isVerified.value && (
						<div class="flex gap-1">
							<button
								type="button"
								onClick={() => handleModeSwitch("AI")}
								class={cn(
									"px-2 py-1 text-[8px] font-bold tracking-widest rounded-sm transition-all",
									chatMode.value === "AI"
										? "bg-primary text-black"
										: "bg-zinc-800 text-white/50 hover:text-white",
								)}
							>
								AI
							</button>
							<button
								type="button"
								onClick={() => handleModeSwitch("LIVE")}
								class={cn(
									"px-2 py-1 text-[8px] font-bold tracking-widest rounded-sm transition-all",
									chatMode.value === "LIVE"
										? "bg-green-500 text-black"
										: "bg-zinc-800 text-white/50 hover:text-white",
								)}
							>
								SENIOR
							</button>
						</div>
					)}
				</div>

				{/* Verification Layer (Lead Capture) */}
				{!isVerified.value ? (
					<div class="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
						<div class="absolute inset-0 bg-grid-white/[0.02] -z-10" />
						<div class="w-full max-w-[280px] flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
							<div class="text-center space-y-2">
								<TerminalIcon
									size={40}
									class="text-primary mx-auto mb-2 animate-pulse"
								/>
								<h3 class="text-lg font-black tracking-widest text-white uppercase">
									Identificación Requerida
								</h3>
								<p class="text-[9px] text-muted-foreground font-mono tracking-widest">
									SECURITY_PROTOCOL_ALPHA: REQUIRED
								</p>
							</div>

							<div class="space-y-4">
								<div class="space-y-1">
									<label
										htmlFor="visitor-name"
										class="text-[9px] font-bold text-primary tracking-widest uppercase ml-1"
									>
										Nombre / Alias
									</label>
									<div class="relative group">
										<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary transition-colors">
											<UserIcon size={14} />
										</div>
										<input
											id="visitor-name"
											type="text"
											class="w-full bg-zinc-900/50 border border-white/10 rounded-sm py-3 pl-9 pr-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-zinc-900 transition-all"
											placeholder="ENTER_NAME"
											value={visitorName.value}
											onInput={(e) => {
												visitorName.value = e.currentTarget.value;
											}}
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label
										htmlFor="visitor-company"
										class="text-[9px] font-bold text-primary tracking-widest uppercase ml-1"
									>
										Empresa / Entidad
									</label>
									<div class="relative group">
										<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-primary transition-colors">
											<BuildingIcon size={14} />
										</div>
										<input
											id="visitor-company"
											type="text"
											class="w-full bg-zinc-900/50 border border-white/10 rounded-sm py-3 pl-9 pr-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-zinc-900 transition-all"
											placeholder="ENTER_CORPORATION (OPTIONAL)"
											value={visitorCompany.value}
											onInput={(e) => {
												visitorCompany.value = e.currentTarget.value;
											}}
											onKeyDown={(e) => e.key === "Enter" && handleVerification()}
										/>
									</div>
								</div>

								<button
									type="button"
									onClick={handleVerification}
									disabled={!visitorName.value.trim()}
									class="w-full mt-4 bg-primary text-black font-black text-xs py-3 rounded-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
								>
									Establecer Conexión
									<ChevronRightIcon
										size={14}
										class="group-hover:translate-x-1 transition-transform"
									/>
								</button>
							</div>
						</div>
					</div>
				) : (
					/* Terminal Messages */
					<div
						class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar relative [scrollbar-gutter:stable]"
						ref={scrollRef}
					>
						{!modeSelected.value && (
							<div class="absolute inset-0 z-10 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
								<TerminalIcon
									size={40}
									class="text-primary mb-6 animate-pulse"
								/>
								<h3 class="text-lg font-black tracking-tighter text-white mb-2 uppercase">
									Link Established
								</h3>
								<p class="text-[10px] text-muted-foreground font-mono mb-8 tracking-widest leading-relaxed">
									WELCOME_ARCHITECT_{visitorName.value.split(" ")[0].toUpperCase()}
									.
									<br /> SELECT_PROTOCOL:
								</p>
								<div class="grid grid-cols-1 gap-4 w-full max-w-[200px]">
									<button
										type="button"
										onClick={() => {
											chatMode.value = "AI";
											modeSelected.value = true;
											messages.value = [
												{
													role: "ASSISTANT",
													content:
														"AI_LINK_STABLE: I am the AI Nexus. Protocol engaged.",
												},
											];
										}}
										class="group relative px-6 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-sm hover:scale-105 active:scale-95 transition-all overflow-hidden"
									>
										<span class="relative z-10 flex items-center justify-center gap-2">
											<BotIcon size={14} /> Asistente Virtual
										</span>
										<div class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
									</button>
									<button
										type="button"
										onClick={() => {
											chatMode.value = "LIVE";
											modeSelected.value = true;
											messages.value = [
												{
													role: "ASSISTANT",
													content: `HUMAN_LINK_INITIALIZING: Alerting Yonatan to "${visitorCompany.value || "Visitor"}" presence...`,
												},
											];
										}}
										class="group relative px-6 py-3 bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-sm hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all border border-white/5"
									>
										<span class="relative z-10 flex items-center justify-center gap-2">
											<UserIcon size={14} /> Contactar Humano
										</span>
										<div class="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
									</button>
								</div>
							</div>
						)}
						{messages.value.map((msg, i) => {
							if (msg.role === "ASSISTANT" && !msg.content && msg.isStreaming)
								return null;
							return (
								<div
									key={i}
									class={cn(
										"flex flex-col gap-2 max-w-[90%] font-mono",
										msg.role === "USER"
											? "self-end items-end"
											: "self-start items-start",
									)}
								>
									<div class="flex items-center gap-2 opacity-40">
										{msg.role === "USER" ? (
											<UserIcon size={10} />
										) : (
											<BotIcon size={10} />
										)}
										<span class="text-[8px] font-bold tracking-[0.2em]">
											{msg.role === "USER"
												? "USER.ARCHITECT"
												: msg.role === "ADMIN"
													? "SENIOR.HUMAN"
													: "SYSTEM.AI"}
										</span>
									</div>
									<div
										class={cn(
											"p-3 text-[11px] leading-relaxed tracking-wide transition-all",
											msg.role === "USER"
												? "bg-zinc-900/60 text-white border-r border-white/20 text-right"
												: msg.role === "ADMIN"
													? "bg-green-500/10 text-green-400 border-l border-green-500/40"
													: "bg-primary/5 text-primary border-l border-primary/40",
										)}
									>
										{msg.content}
									</div>
								</div>
							);
						})}
						{isTyping.value &&
							!messages.value[messages.value.length - 1]?.content && (
								<div class="flex flex-col gap-2 self-start items-start opacity-80">
									<div class="flex items-center gap-2 opacity-40">
										<BotIcon size={10} />
										<span class="text-[8px] font-bold tracking-[0.2em]">
											SYSTEM.PROCESS
										</span>
									</div>
									<div class="p-3 bg-primary/5 border border-primary/20 text-primary flex items-center gap-2">
										<span class="relative flex h-2 w-2">
											<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
											<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
										</span>
										<span class="font-mono text-[10px] tracking-[0.2em] animate-pulse">
											CALCULATING_RESPONSE...
										</span>
									</div>
								</div>
							)}
						{isAdminTyping.value && chatMode.value === "LIVE" && (
							<div class="flex flex-col gap-2 self-start items-start opacity-80">
								<div class="flex items-center gap-2 opacity-40">
									<UserIcon size={10} />
									<span class="text-[8px] font-bold tracking-[0.2em]">
										SENIOR.TYPING
									</span>
								</div>
								<div class="p-3 bg-green-500/5 border border-green-500/20 text-green-400 flex items-center gap-2">
									<span class="relative flex h-2 w-2">
										<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
										<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
									</span>
									<span class="font-mono text-[10px] tracking-[0.2em] animate-pulse">
										HUMAN_TYPING...
									</span>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Terminal Input Bar - Only show if verified */}
				{isVerified.value && (
					<div class="p-4 border-t border-primary/10 bg-black/40">
						<div class="flex gap-3 items-center bg-zinc-900/50 border border-white/5 p-1 rounded-sm focus-within:border-primary/40 focus-within:bg-zinc-900/80 transition-all">
							<input
								type="text"
								aria-label="Nexus Input"
								class="flex-1 bg-transparent px-4 py-2 text-[11px] font-mono text-white focus:outline-none placeholder:text-white/20"
								placeholder={
									messages.value.filter((m) => m.role === "USER").length >= 30
										? "LIMIT_REACHED"
										: "INITIALIZE_COMMAND..."
								}
								value={inputValue.value}
								onInput={(e) => {
									inputValue.value = e.currentTarget.value;
								}}
								onKeyDown={(e) => e.key === "Enter" && handleSend()}
								disabled={
									isTyping.value ||
									messages.value.filter((m) => m.role === "USER").length >= 30
								}
							/>
							<button
								aria-label="Transmit"
								class="w-8 h-8 flex items-center justify-center bg-primary text-black rounded-sm hover:scale-105 active:scale-95 transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed group/send"
								onClick={handleSend}
								type="button"
								disabled={
									!inputValue.value.trim() ||
									isTyping.value ||
									messages.value.filter((m) => m.role === "USER").length >= 30
								}
							>
								<SendIcon
									size={14}
									class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
								/>
							</button>
						</div>
						<div class="mt-2 flex justify-between items-center opacity-20 px-1">
							<span class="text-[7px] font-bold tracking-[0.2em]">
								{messages.value.filter((m) => m.role === "USER").length}/30
								MESSAGES
							</span>
							<span class="text-[7px] font-bold tracking-[0.2em]">
								{chatMode.value === "AI" ? "SSE_STREAM" : "WEBSOCKET_LIVE"}
							</span>
						</div>
					</div>
				)}

				{/* FAB Button */}
			</div>
			{/* FAB Button */}
			<button
				type="button"
				aria-label={isChatOpen.value ? "Close Interface" : "Open AI Nexus"}
				onClick={() => {
					isChatOpen.value = !isChatOpen.value;
				}}
				class={cn(
					"fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:scale-110 active:scale-95 group md:hidden",
					isChatOpen.value
						? "bg-red-500 hover:bg-red-600 text-white"
						: "bg-black/80 border border-primary/50 text-primary hover:bg-primary hover:text-black backdrop-blur-md",
				)}
			>
				{isChatOpen.value ? <XIcon size={24} /> : <BotIcon size={24} />}
			</button>
		</>
	);
}
