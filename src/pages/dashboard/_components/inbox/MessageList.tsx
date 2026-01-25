import { contactDestroyApi } from "@modules/contact/apis/contact.destroy.api";
import {
	type ContactIndexTable,
	contactIndexApi,
} from "@modules/contact/apis/contact.index.api";
import { contactMarkAsReadApi } from "@modules/contact/apis/contact.mark-as-read.api";
import type { ContactMessageSchema } from "@modules/contact/schemas/contact-message.schema";
import { useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import { CheckCircle, Filter, Mail, Trash } from "lucide-preact";
import MessageDetail from "./MessageDetail";

export default function MessageList() {
	const selectedId = useSignal<number | null>(null);
	const filterStatus = useSignal<"all" | "read" | "unread">("all");

	const table = useTable({
		columns: [
			{ key: "name", header: "From" },
			{ key: "subject", header: "Subject" },
			{ key: "created_at", header: "Date" },
		],
		pagination: { limit: 20 },
	});

	const query = contactIndexApi(
		table as unknown as ContactIndexTable, // Cast necessary due to complex type inference in some helper
		filterStatus.value === "all"
			? null
			: filterStatus.value === "read"
				? true
				: false,
	);
	const markAsReadMutation = contactMarkAsReadApi();
	const destroyMutation = contactDestroyApi();

	const messages = (query.data?.results as ContactMessageSchema[]) || [];
	const selectedMessage = messages.find((m) => m.id === selectedId.value);

	const onSelect = (id: number) => {
		selectedId.value = id;
		const msg = messages.find((m) => m.id === id);
		if (msg && !msg.is_read) {
			markAsReadMutation.mutate(id, {
				onSuccess: () => {
					query.refetch(false);
				},
			});
		}
	};

	const onDelete = (id: number) => {
		sweetModal({
			title: "Discard Signal?",
			text: "This transmission will be permanently erased from the secure logs.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "YES, DISCARD",
			cancelButtonText: "CANCEL",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				destroyMutation.mutate(id, {
					onSuccess: () => {
						selectedId.value = null;
						query.refetch(false);
						sweetModal({
							icon: "success",
							title: "Signal Erased",
							timer: 1500,
							showConfirmButton: false,
						});
					},
				});
			}
		});
	};

	return (
		<div class="flex h-[700px] border border-white/5 rounded-2xl overflow-hidden bg-zinc-950/50 backdrop-blur-sm shadow-2xl">
			{/* List */}
			<div class="w-full md:w-1/3 border-r border-white/5 flex flex-col bg-black/20">
				<div class="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center text-primary">
					<div class="font-black font-mono text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
						Transmission_Feed
						{query.isLoading && (
							<div class="w-1.5 h-1.5 bg-primary animate-ping rounded-full" />
						)}
					</div>
					<div class="relative group">
						<button
							class="text-muted-foreground hover:text-white transition-colors"
							aria-label="Filter Messages"
						>
							<Filter size={14} />
						</button>
						<div class="absolute right-0 top-full mt-2 w-32 bg-zinc-900 border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-20 flex flex-col p-1">
							{(["all", "unread", "read"] as const).map((status) => (
								<button
									key={status}
									onClick={() => {
										filterStatus.value = status;
										query.refetch();
									}}
									class={`text-[10px] font-mono uppercase text-left px-3 py-2 rounded hover:bg-white/5 ${
										filterStatus.value === status
											? "text-primary font-bold bg-primary/5"
											: "text-muted-foreground"
									}`}
								>
									{status}
								</button>
							))}
						</div>
					</div>
				</div>
				<div class="flex-1 overflow-y-auto custom-scrollbar">
					{messages.length === 0 && !query.isLoading ? (
						<div class="p-8 text-center text-muted-foreground/40 font-mono text-xs uppercase flex flex-col items-center gap-2 mt-10">
							<Mail size={24} class="opacity-20" />
							<span>No signals detected.</span>
						</div>
					) : (
						messages.map((msg) => (
							<div
								key={msg.id}
								onClick={() => onSelect(msg.id)}
								class={`p-5 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all duration-300 group relative ${
									selectedId.value === msg.id
										? "bg-primary/5 border-r-2 border-r-primary"
										: ""
								} ${!msg.is_read ? "bg-primary/5" : "opacity-70"}`}
							>
								{!msg.is_read && (
									<div class="absolute top-5 left-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
								)}
								<div class="flex justify-between mb-2 pl-2">
									<span
										class={`text-xs font-black font-mono tracking-tight truncate max-w-[120px] ${
											!msg.is_read ? "text-primary" : "text-foreground/70"
										}`}
									>
										{msg.name}
									</span>
									<span class="text-[9px] font-mono text-muted-foreground/50">
										{new Date(msg.created_at).toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
										})}
									</span>
								</div>
								<p class="text-xs font-bold text-foreground mb-1 truncate tracking-tight uppercase pl-2">
									{msg.subject || "NO_SUBJECT"}
								</p>
								<p class="pl-2 text-[10px] text-muted-foreground/60 truncate font-mono line-clamp-2">
									{msg.message}
								</p>
							</div>
						))
					)}
					{/* Pagination Load More (If implemented in API later) */}
				</div>
			</div>

			{/* Detail */}
			<div class="flex-1 flex flex-col bg-black/40 relative overflow-hidden">
				{/* Background Grid Pattern for Detail */}
				<div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

				{selectedMessage ? (
					<MessageDetail
						message={selectedMessage}
						onClose={() => {
							selectedId.value = null;
						}}
						onUpdate={() => {
							query.refetch(false);
						}}
					/>
				) : (
					<div class="flex-1 flex flex-col items-center justify-center text-muted-foreground/20 p-20 text-center relative z-10">
						<div class="w-24 h-24 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center mb-6 animate-[spin_20s_linear_infinite]">
							<Mail size={40} class="opacity-20" />
						</div>
						<p class="font-mono text-xs uppercase tracking-[0.4em] mb-2 text-zinc-500">
							Awaiting_Selection
						</p>
						<p class="text-[10px] font-mono opacity-50 uppercase tracking-widest text-zinc-600">
							Select a transmission for detailed analysis.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
