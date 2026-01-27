import { sizeIcon } from "@infrastructure/utils/client";
import { toggleChat } from "@stores/chat.store";
import { BotIcon } from "lucide-preact";

export default function AI_AssistantButton() {
	return (
		<button
			type="button"
			class="w-full p-4 flex items-center gap-4 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all rounded-sm group relative overflow-hidden"
			onClick={toggleChat}
			aria-label="Open AI Assistant"
		>
			<div class="absolute inset-0 bg-primary/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
			<div class="p-2 bg-primary/20 rounded-sm">
				<BotIcon {...sizeIcon.medium} class="text-primary" />
			</div>
			<div class="flex flex-col items-start font-mono">
				<span class="text-[10px] font-bold tracking-[0.2em] text-primary group-hover:text-glow">
					AI_ASSISTANT
				</span>
				<span class="text-[9px] text-muted-foreground/60 uppercase tracking-widest">
					Awaiting Prompt...
				</span>
			</div>
		</button>
	);
}
