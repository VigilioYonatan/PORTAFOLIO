import { MessageSquareIcon } from "lucide-preact";

interface Conversation {
	id: string;
	ip: string;
	lastMessage: string;
	date: string;
	isLive: boolean;
}

const CONVERSATIONS: Conversation[] = [
	{
		id: "1",
		ip: "192.168.1.1",
		lastMessage: "How do you implement RAG?",
		date: "10 mins ago",
		isLive: true,
	},
	{
		id: "2",
		ip: "203.0.113.5",
		lastMessage: "Pricing for freelance?",
		date: "2 hrs ago",
		isLive: false,
	},
	{
		id: "3",
		ip: "198.51.100.2",
		lastMessage: "Nice portfolio!",
		date: "1 day ago",
		isLive: false,
	},
];

export function ConversationList() {
	return (
		<div class="border-r border-border h-full flex flex-col bg-card/50">
			<div class="p-4 border-b border-border">
				<h3 class="font-bold flex items-center gap-2">
					<MessageSquareIcon size={18} /> Sessions
				</h3>
			</div>
			<div class="flex-1 overflow-y-auto">
				{CONVERSATIONS.map((conv) => (
					<div
						key={conv.id}
						class="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors relative group"
					>
						<div class="flex justify-between items-start mb-1">
							<span class="font-mono text-xs text-primary">{conv.ip}</span>
							<span class="text-[10px] text-muted-foreground">{conv.date}</span>
						</div>
						<p class="text-sm line-clamp-2 text-muted-foreground group-hover:text-foreground">
							{conv.lastMessage}
						</p>
						{conv.isLive && (
							<span
								class="absolute top-4 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"
								title="Live Now"
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export function ChatViewer() {
	return (
		<div class="flex flex-col h-full bg-background/50">
			<div class="p-4 border-b border-border flex justify-between items-center">
				<div>
					<h3 class="font-bold">192.168.1.1</h3>
					<span class="text-xs text-green-500">Active now</span>
				</div>
				<button
					type="button"
					aria-label="Take Over Control"
					class="text-xs font-mono border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-black transition-colors"
				>
					TAKE_OVER_CONTROL
				</button>
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
