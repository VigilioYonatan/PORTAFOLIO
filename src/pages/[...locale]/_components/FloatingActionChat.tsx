import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import {  XIcon, SendIcon, BotIcon, TerminalIcon, UserIcon, WifiIcon, WifiOffIcon } from "lucide-preact";
import { useRef, useEffect } from "preact/hooks";
import { conversationStoreApi } from "@modules/chat/apis/conversation.store.api";
import { chatMessagePublicStoreApi } from "@modules/chat/apis/chat-message.public-store.api";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
    isStreaming?: boolean;
}


import { isChatOpen } from "@stores/chat.store";

export default function FloatingActionChat() {
	const isOpen = isChatOpen;
	const conversationId = useSignal<number | null>(null);
	const messages = useSignal<ChatMessage[]>([
		{
			role: "assistant",
			content: "SYSTEM_READY: I am the AI Nexus. How can I assist your architectural inquiry today?",
		},
	]);
	const inputValue = useSignal<string>("");
	const isTyping = useSignal<boolean>(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	const startConversationMutation = conversationStoreApi();
	const sendMessageMutation = chatMessagePublicStoreApi(conversationId.value || 0);

	useEffect(() => {
		const handleToggle = () => (isOpen.value = !isOpen.value);
		window.addEventListener("toggle-chat", handleToggle);
		return () => window.removeEventListener("toggle-chat", handleToggle);
	}, []);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages.value.length, isOpen.value, isTyping.value]);

	async function handleSend() {
		if (!inputValue.value.trim() || isTyping.value) return;

		const userText = inputValue.value;
		inputValue.value = "";
		
		// Ensure conversation is started
		if (!conversationId.value) {
			try {
				// Generate simple visitor ID if not exists
				const visitorId = localStorage.getItem("chat_visitor_id") || Math.random().toString(36).substring(2, 15);
				localStorage.setItem("chat_visitor_id", visitorId);

				const session = await startConversationMutation.mutateAsync({ 
					title: "Anonymous Architect Session", 
					visitor_id: visitorId 
				});
				
				if (session && session.conversation?.id) {
					conversationId.value = session.conversation.id;
				} else {
					throw new Error("Invalid session response");
				}
			} catch (err) {
				console.error("Failed to initialize neural link", err);
                messages.value = [...messages.value, { role: "assistant", content: "ERROR: NEURAL_LINK_ESTABLISHMENT_FAILED. RETRY_LATER." }];
                return;
			}
		}

		// Add user message
		messages.value = [...messages.value, { role: "user", content: userText }];
		isTyping.value = true;

		// Send message
		try {
			await sendMessageMutation.mutateAsync({ content: userText });
			
			// Start SSE for real-time AI response
			const eventSource = new EventSource(`/api/v1/chat/conversations/${conversationId.value}/stream`);
			
			// Initial placeholder for streaming response
			const streamingMsgIndex = messages.value.length;
			messages.value = [...messages.value, { role: "assistant", content: "", isStreaming: true }];

			eventSource.onmessage = (event) => {
				const data = JSON.parse(event.data);
				
				if (data.type === "chunk") {
					// Append chunk to the last message
					const currentMessages = [...messages.value];
					if (currentMessages[streamingMsgIndex]) {
						currentMessages[streamingMsgIndex] = {
							...currentMessages[streamingMsgIndex],
							content: currentMessages[streamingMsgIndex].content + data.content
						};
						messages.value = currentMessages;
					}
				} else if (data.type === "done" || data.type === "error") {
					// Stream finished
					const currentMessages = [...messages.value];
					if (currentMessages[streamingMsgIndex]) {
						currentMessages[streamingMsgIndex] = {
							...currentMessages[streamingMsgIndex],
							isStreaming: false
						};
						messages.value = currentMessages;
					}
					isTyping.value = false;
					eventSource.close();
				}
			};

			eventSource.onerror = (err) => {
				console.error("SSE Connection Error", err);
				const currentMessages = [...messages.value];
				// If we have some content, just mark done. If empty, show error.
				if (currentMessages[streamingMsgIndex] && !currentMessages[streamingMsgIndex].content) {
					currentMessages[streamingMsgIndex] = {
						role: "assistant",
						content: "ERROR: SIGNAL_INTERRUPTED. RE-ALIGNING SENSORS...",
						isStreaming: false
					};
				} else if (currentMessages[streamingMsgIndex]) {
					currentMessages[streamingMsgIndex].isStreaming = false;
				}
				messages.value = currentMessages;
				isTyping.value = false;
				eventSource.close();
			};

		} catch (err) {
			console.error("Message transmission failure", err);
            messages.value = [...messages.value, { role: "assistant", content: "ERROR: TRANSMISSION_TIMEOUT. SIGNAL_LOST." }];
            isTyping.value = false;
		}
	}

	return (
		<>
			{/* The Cyberpunk FAB */}
			<button
				type="button"
				onClick={() => (isOpen.value = !isOpen.value)}
				aria-label={isOpen.value ? "Close Interface" : "Open AI Nexus"}
				class={cn(
					"fixed bottom-24 right-6 z-50 w-16 h-16 rounded-sm shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 group overflow-hidden border border-primary/20 bg-black/40 backdrop-blur-md",
					isOpen.value ? "rotate-180 border-primary/60" : "hover:border-primary/40",
				)}
			>
                {/* Glow Background */}
                <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div class="absolute inset-0 bg-scanline opacity-10" />

				{isOpen.value ? <XIcon size={24} class="text-primary" /> : <BotIcon size={24} class="text-primary animate-glitch-sm" />}

				{/* Pulsing Status */}
				{!isOpen.value && (
					<span class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-glow" />
				)}
			</button>

			{/* The Terminal Window */}
			<div
				class={cn(
					"fixed bottom-40 right-6 z-50 w-[380px] md:w-[420px] h-[550px] bg-zinc-950/90 border border-primary/20 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden backdrop-blur-xl",
					isOpen.value
						? "opacity-100 scale-100 translate-y-0"
						: "opacity-0 scale-95 translate-y-10 pointer-events-none",
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
							<h4 class="font-black text-[10px] tracking-[0.3em] uppercase text-white">AI_NEXUS_v2.0.4</h4>
							<span class="text-[8px] text-primary/80 flex items-center gap-1 font-bold tracking-widest uppercase">
								{conversationId.value ? <WifiIcon size={8} class="text-green-500" /> : <WifiOffIcon size={8} class="text-yellow-500" />}
								{conversationId.value ? "ENCRYPTED_LINK_ACTIVE" : "LINK_WAITING_INIT"}
							</span>
						</div>
					</div>
                    <div class="flex gap-1.5">
                        <div class="w-2 h-2 rounded-full border border-white/10" />
                        <div class="w-2 h-2 rounded-full border border-white/10" />
                        <div class="w-2 h-2 rounded-full bg-primary/40 border border-primary/60" />
                    </div>
				</div>

				{/* Terminal Messages */}
				<div
					class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar relative"
					ref={scrollRef}
				>
					{messages.value.map((msg, i) => (
						<div
							key={i}
							class={cn(
								"flex flex-col gap-2 max-w-[90%] font-mono",
								msg.role === "user" ? "self-end items-end" : "self-start items-start",
							)}
						>
                            <div class="flex items-center gap-2 opacity-40">
                                {msg.role === "assistant" ? <BotIcon size={10} /> : <UserIcon size={10} />}
                                <span class="text-[8px] font-bold tracking-[0.2em]">{msg.role === "assistant" ? "SYSTEM.AI" : "USER.ARCHITECT"}</span>
                            </div>
							<div
								class={cn(
									"p-3 text-[11px] leading-relaxed tracking-wide transition-all",
									msg.role === "assistant"
										? "bg-primary/5 text-primary-foreground border-l border-primary/40"
										: "bg-zinc-900/60 text-white border-r border-white/20 text-right",
								)}
							>
								{msg.content}
							</div>
						</div>
					))}
                    {isTyping.value && (
                        <div class="flex gap-2 items-center self-start text-primary/60 animate-pulse font-mono text-[10px] tracking-widest px-1">
                            <div class="flex gap-1">
                                <span class="animate-[bounce_1s_infinite]">.</span>
                                <span class="animate-[bounce_1s_infinite_0.2s]">.</span>
                                <span class="animate-[bounce_1s_infinite_0.4s]">.</span>
                            </div>
                            ANALYZING_INPUT
                        </div>
                    )}
				</div>

				{/* Terminal Input Bar */}
				<div class="p-4 border-t border-primary/10 bg-black/40">
					<div class="flex gap-3 items-center bg-zinc-900/50 border border-white/5 p-1 rounded-sm focus-within:border-primary/40 focus-within:bg-zinc-900/80 transition-all">
						<input
							type="text"
							aria-label="Nexus Input"
							class="flex-1 bg-transparent px-4 py-2 text-[11px] font-mono text-white focus:outline-none placeholder:text-white/20"
							placeholder="INITIALIZE_COMMAND..."
							value={inputValue.value}
							onInput={(e) => (inputValue.value = e.currentTarget.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isTyping.value}
						/>
						<button
							aria-label="Transmit"
							class="w-8 h-8 flex items-center justify-center bg-primary text-black rounded-sm hover:scale-105 active:scale-95 transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed group/send"
							onClick={handleSend}
                            disabled={!inputValue.value.trim() || isTyping.value}
						>
							<SendIcon size={14} class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
						</button>
					</div>
                    <div class="mt-2 flex justify-between items-center opacity-20 px-1">
                        <span class="text-[7px] font-bold tracking-[0.2em]">SECURE_TUNNEL: TLS_1.3</span>
                        <span class="text-[7px] font-bold tracking-[0.2em]">AES_256_GCM</span>
                    </div>
				</div>
			</div>
		</>
	);
}

