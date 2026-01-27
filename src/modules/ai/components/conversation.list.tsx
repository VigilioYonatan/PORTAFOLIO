import { cn } from "@infrastructure/utils/client";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { conversationIndexApi } from "@modules/chat/apis/conversation.index.api";
import usePaginator from "@vigilio/preact-paginator";
import { CalendarClock, User } from "lucide-preact";

interface ConversationListProps {
	onSelect?: (id: string) => void;
	activeId?: string | null;
}

export default function ConversationList({
	onSelect,
	activeId,
}: ConversationListProps) {
	const paginator = usePaginator({ limit: 20 });
	const query = conversationIndexApi(null, paginator);

	return (
		<div class="border-r border-border h-full flex flex-col bg-black/20">
			<div class="p-4 border-b border-border/50 flex items-center justify-between">
				<span class="font-bold text-xs uppercase tracking-widest text-muted-foreground">
					Recent Sessions
				</span>
				<span class="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-500">
					{query.data?.count ?? 0} LOGS
				</span>
			</div>

			<div class="flex-1 overflow-y-auto custom-scrollbar">
				{query.isLoading ? (
					<div class="p-4 space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} class="h-16 bg-white/5 animate-pulse rounded-lg" />
						))}
					</div>
				) : (
					<div class="flex flex-col">
						{query.data?.results.map((chat) => (
							<div
								key={chat.id}
								onClick={() => onSelect?.(String(chat.id))}
								class={cn(
									"p-4 border-b border-white/5 cursor-pointer transition-all group relative overflow-hidden",
									activeId === String(chat.id)
										? "bg-primary/5 border-l-2 border-l-primary"
										: "hover:bg-white/2 border-l-2 border-l-transparent hover:border-l-primary/30",
								)}
							>
								{/* Active Indicator Background */}
								{activeId === String(chat.id) && (
									<div class="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent pointer-events-none" />
								)}

								<div class="relative z-10">
									<p
										class={cn(
											"text-xs font-bold mb-1 truncate transition-colors ",
											activeId === String(chat.id)
												? "text-primary"
												: "text-zinc-300 group-hover:text-primary",
										)}
									>
										{chat.title || `SESSION #${chat.id}`}
									</p>
									<div class="flex items-center justify-between text-[10px] text-muted-foreground">
										<div class="flex items-center gap-1.5">
											<User size={10} />
											<span class="truncate max-w-[80px]">
												{chat.ip_address}
											</span>
										</div>
										<div class="flex items-center gap-1.5">
											<CalendarClock size={10} />
											<span>{formatDateTz(chat.created_at)}</span>
										</div>
									</div>
								</div>
							</div>
						))}

						{query.data?.results.length === 0 && (
							<div class="p-8 text-center text-muted-foreground text-xs font-mono">
								NO_SESSIONS_RECORDED
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
