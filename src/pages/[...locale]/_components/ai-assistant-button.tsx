import { cn, sizeIcon } from "@infrastructure/utils/client";
import { isChatOpen, toggleChat } from "@stores/chat.store";
import { BotIcon, XIcon } from "lucide-preact";

export default function AI_AssistantButton() {
	const isOpen = isChatOpen.value;

	return (
		<button
			type="button"
			class={cn(
				"w-full p-4 flex items-center gap-4 border transition-all rounded-sm group relative overflow-hidden",
				isOpen
					? "bg-primary/20 border-primary/60 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
					: "bg-primary/10 border-primary/20 hover:bg-primary/20",
			)}
			onClick={toggleChat}
			aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
		>
			<div
				class={cn(
					"absolute inset-0 bg-primary/5 animate-pulse transition-opacity",
					isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
				)}
			/>
			<div
				class={cn(
					"p-2 rounded-sm transition-colors",
					isOpen ? "bg-primary text-black" : "bg-primary/20 text-primary",
				)}
			>
				{isOpen ? (
					<XIcon {...sizeIcon.medium} />
				) : (
					<BotIcon {...sizeIcon.medium} />
				)}
			</div>
			<div class="flex flex-col items-start font-mono">
				<span
					class={cn(
						"text-[10px] font-bold tracking-[0.2em] transition-colors group-hover:text-glow",
						isOpen ? "text-white" : "text-primary",
					)}
				>
					{isOpen ? "CLOSE_TERMINAL" : "AI_ASSISTANT"}
				</span>
				<span class="text-[9px] text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
					{isOpen ? (
						<>
							<span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
							Session Active
						</>
					) : (
						"Awaiting Prompt..."
					)}
				</span>
			</div>
		</button>
	);
}
