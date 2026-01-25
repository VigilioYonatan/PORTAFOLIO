import { useEntranceAnimation } from "@hooks/useMotion";
import { cn } from "@infrastructure/utils/client";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { chatMessageIndexApi } from "@modules/chat/apis/chat-message.index.api";
import { useSignal, useSignalEffect } from "@preact/signals";
import {
	Bot,
	Clock,
	ExternalLink,
	FileText,
	Loader2,
	Play,
	User,
} from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

interface ChatViewerProps {
	conversationId: number;
}

export default function ChatViewer({ conversationId }: ChatViewerProps) {
	const query = chatMessageIndexApi(conversationId);
	const containerRef = useEntranceAnimation<HTMLDivElement>(0.2);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto scroll to bottom on new messages
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [query.data]);

	if (!conversationId) {
		return (
			<div class="h-full flex flex-col items-center justify-center text-muted-foreground/30 font-mono tracking-widest gap-4">
				<Bot size={48} className="animate-pulse" />
				SELECT_SESSION_TO_INSPECT
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="h-full flex flex-col bg-zinc-950/30 overflow-hidden"
		>
			{/* Header */}
			<div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
				<h3 className="font-bold text-sm text-foreground flex items-center gap-2">
					<Clock size={14} className="text-primary" />
					SESSION_LOG::{conversationId}
				</h3>
				<div class="flex items-center gap-2">
					<span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
						ID: {conversationId}
					</span>
				</div>
			</div>

			{/* Messages */}
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth"
			>
				{query.isLoading ? (
					<div class="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50 text-xs font-mono">
						<Loader2 size={24} class="animate-spin" />
						DECRYPTING_LOGS...
					</div>
				) : (
					query.data?.results.map((msg) => (
						<div
							key={msg.id}
							className={cn(
								"flex gap-4 max-w-3xl animate-in slide-in-from-bottom-2 fade-in duration-300",
								msg.role === "USER" ? "ml-auto flex-row-reverse" : "",
							)}
						>
							{/* Avatar */}
							<div
								className={cn(
									"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-lg",
									msg.role === "USER"
										? "bg-primary/20 border-primary/30 text-primary"
										: "bg-emerald-500/20 border-emerald-500/30 text-emerald-500",
								)}
							>
								{msg.role === "USER" ? <User size={16} /> : <Bot size={16} />}
							</div>

							{/* Bubble */}
							<div className="flex flex-col gap-2 min-w-0 max-w-[80%]">
								<div
									className={cn(
										"p-4 rounded-2xl text-sm leading-relaxed border shadow-sm backdrop-blur-sm",
										msg.role === "USER"
											? "bg-primary/10 border-primary/20 text-primary-foreground rounded-tr-sm"
											: "bg-zinc-900/80 border-white/10 text-zinc-300 rounded-tl-sm",
									)}
								>
									{msg.content}
								</div>

								{/* RAG Sources (Only for Assistant) */}
								{msg.role === "ASSISTANT" &&
									msg.sources &&
									(msg.sources as any[]).length > 0 && (
										<div className="flex flex-col gap-2 mt-1 pl-1">
											<span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1">
												<FileText size={10} /> Neural References
											</span>
											<div className="grid grid-cols-1 gap-2">
												{(msg.sources as any[]).map((source, i) => (
													<div
														key={i}
														className="bg-black/40 border border-white/5 rounded p-2 flex items-start gap-3 hover:border-primary/30 transition-colors group cursor-pointer"
													>
														<div className="w-0.5 h-full bg-primary/50" />
														<div className="flex-1 min-w-0">
															<div className="flex justify-between items-center mb-1">
																<span className="text-xs font-bold text-zinc-400 truncate group-hover:text-primary transition-colors">
																	{source.title}
																</span>
																<span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1 rounded">
																	{Math.round((source.relevance || 0) * 100)}%
																</span>
															</div>
															<p className="text-[10px] text-zinc-600 line-clamp-2 font-mono">
																"{source.chunk_content}"
															</p>
														</div>
													</div>
												))}
											</div>
										</div>
									)}

								<span
									className={cn(
										"text-[10px] font-mono opacity-40",
										msg.role === "USER" ? "text-right" : "text-left",
									)}
								>
									{formatDateTz(msg.created_at)}
								</span>
							</div>
						</div>
					))
				)}
				{query.data?.results.length === 0 && (
					<div class="text-center text-muted-foreground text-xs font-mono py-10 opacity-50">
						EMPTY_TRANSMISSION
					</div>
				)}
			</div>
		</div>
	);
}
