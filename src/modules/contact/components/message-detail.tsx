import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { contactMarkAsReadApi } from "@modules/contact/apis/contact.mark-as-read.api";
import type { ContactMessageSchema } from "@modules/contact/schemas/contact-message.schema";
import {
	Calendar,
	Info,
	Mail,
	MessageSquare,
	Phone,
	User,
} from "lucide-preact";
import { useEffect } from "preact/hooks";

import { type Lang, useTranslations } from "@src/i18n";

interface MessageDetailProps {
	message: ContactMessageSchema;
	onUpdate: (data: Partial<ContactMessageSchema>) => void;
    lang?: Lang;
}

export default function MessageDetail({
	message,
	onUpdate,
    lang = "es"
}: MessageDetailProps) {
    const t = useTranslations(lang);
	const updateMutation = contactMarkAsReadApi();

	useEffect(() => {
		if (!message.is_read) {
			updateMutation.mutate(message.id, {
				onSuccess(data) {
					onUpdate(data.message);
				},
			});
		}
	}, [message.id]);


	return (
		<div class="space-y-6 py-2">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase">
					{t("dashboard.message.detail_protocol")}
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					{t("dashboard.message.detail_view")}
				</h2>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-4">
					<div class="flex flex-col gap-1">
						<span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
							<User size={10} /> {t("dashboard.message.sender")}
						</span>
						<span class="text-sm font-bold text-foreground">
							{message.name}
						</span>
					</div>

					<div class="flex flex-col gap-1">
						<span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
							<Mail size={10} /> {t("contact.form.email")}
						</span>
						<a
							href={`mailto:${message.email}`}
							class="text-sm font-medium text-primary hover:underline"
						>
							{message.email}
						</a>
					</div>

					{message.phone_number && (
						<div class="flex flex-col gap-1">
							<span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
								<Phone size={10} /> {t("dashboard.message.phone")}
							</span>
							<span class="text-sm font-medium text-foreground">
								{message.phone_number}
							</span>
						</div>
					)}
				</div>

				<div class="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-4">
					<div class="flex flex-col gap-1">
						<span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
							<Calendar size={10} /> {t("dashboard.message.date")}
						</span>
						<span class="text-sm font-medium text-foreground">
							{formatDateTz(message.created_at)}
						</span>
					</div>

					<div class="flex flex-col gap-1">
						<span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
							<Info size={10} /> {t("dashboard.message.ip")}
						</span>
						<span class="text-sm font-mono text-muted-foreground">
							{message.ip_address || "ENCRYPTED"}
						</span>
					</div>

					<div class="flex flex-col gap-1">
						<span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
							<MessageSquare size={10} /> {t("dashboard.message.subject")}
						</span>
						<span class="text-sm font-bold text-foreground">
							{message.subject || "(Sin Asunto)"}
						</span>
					</div>
				</div>
			</div>

			<div class="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative overflow-hidden">
				<div class="absolute top-0 right-0 p-4 opacity-5">
					<MessageSquare size={80} />
				</div>
				<div class="relative z-10">
					<span class="text-[9px] font-black text-primary uppercase tracking-widest block mb-4">
						{t("contact.form.message")}
					</span>
					<div class="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
						{message.message}
					</div>
				</div>
			</div>

			{updateMutation.isLoading && (
				<div class="flex items-center gap-2 text-[10px] font-mono text-primary animate-pulse uppercase">
					{t("common.loading")}
				</div>
			)}
		</div>
	);
}
