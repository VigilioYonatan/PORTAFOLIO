import { formatTimeAgo } from "@infrastructure/utils/hybrid/date.utils";
import { contactMarkAsReadApi } from "@modules/contact/apis/contact.mark-as-read.api";
import type { ContactMessageSchema } from "@modules/contact/schemas/contact-message.schema";
import { sweetModal } from "@vigilio/sweet";
import { CheckCircle2, Clock, Mail, MessageSquare, User } from "lucide-preact";

interface MessageDetailProps {
	message: ContactMessageSchema;
	onClose: () => void;
	onUpdate: () => void;
}

export default function MessageDetail({
	message,
	onClose,
	onUpdate,
}: MessageDetailProps) {
	const markAsReadMutation = contactMarkAsReadApi();

	if (!message) return null;

	return (
		<div class="flex flex-col h-full bg-zinc-900/50">
			{/* Detail Header */}
			<div class="p-8 border-b border-white/5 space-y-6">
				<div class="flex justify-between items-start">
					<div class="space-y-1">
						<h2 class="text-2xl font-black tracking-tighter uppercase text-foreground">
							{message.subject}
						</h2>
						<div class="flex items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
							<span class="flex items-center gap-1.5">
								<User size={12} class="text-primary/50" /> {message.name} &lt;
								{message.email}&gt;
							</span>
							<span class="flex items-center gap-1.5">
								<Clock size={12} class="text-primary/50" />{" "}
								{formatTimeAgo(message.created_at)}
							</span>
						</div>
					</div>

					{!message.is_read && (
						<button
							onClick={() => {
								markAsReadMutation.mutate(message.id, {
									onSuccess() {
										sweetModal({
											icon: "success",
											title: "Transmission Synced",
											text: "Marked as read successfully.",
											timer: 1500,
											showConfirmButton: false,
										});
										onUpdate();
									},
								});
							}}
							disabled={markAsReadMutation.isLoading || false}
							class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[10px] font-black tracking-widest uppercase rounded-lg hover:opacity-90 transition-all shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-50"
						>
							<CheckCircle2 size={14} />
							MARK_AS_READ
						</button>
					)}
				</div>
			</div>

			{/* Message Body */}
			<div class="flex-1 p-8 overflow-auto custom-scrollbar">
				<div class="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden shadow-inner">
					<div class="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
						<MessageSquare size={200} />
					</div>
					<div class="relative z-10 space-y-4">
						<div class="text-[10px] font-black font-mono tracking-[0.5em] text-primary/40 uppercase mb-6 flex items-center gap-2">
							<Mail size={12} /> INCOMING_TRANSMISSION
						</div>
						<p class="text-sm text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap select-text">
							{message.message}
						</p>
					</div>
				</div>
			</div>

			{/* Footer Actions */}
			<div class="p-8 border-t border-white/5 flex gap-4 bg-black/20">
				<button
					onClick={onClose}
					class="px-6 py-2.5 border border-white/10 text-[10px] font-black tracking-widest uppercase rounded-lg hover:bg-white/5 transition-all text-muted-foreground hover:text-white"
				>
					RETURN_TO_INBOX
				</button>
				<a
					href={`mailto:${message.email}?subject=Re: ${message.subject}`}
					class="px-6 py-2.5 bg-zinc-800 text-white text-[10px] font-black tracking-widest uppercase rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2"
				>
					INITIALIZE_REPLY
				</a>
			</div>
		</div>
	);
}
