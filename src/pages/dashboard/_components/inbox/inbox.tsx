import MessageList from "@modules/contact/components/message-list";
import { setChatOpen } from "@modules/web/libs/sound-manager";
import { type Lang, useTranslations } from "@src/i18n";
import { MailIcon, ShieldCheckIcon, WifiIcon } from "lucide-preact";
import { useEffect } from "preact/hooks";

interface InboxProps {
	params: {
		lang: Lang;
	};
}
export default function Inbox({ params }: InboxProps) {
	const t = useTranslations(params.lang);

	useEffect(() => {
		setChatOpen(true);
		return () => setChatOpen(false);
	}, []);

	return (
		<div class="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500 relative">
			{/* Ambient System Scanlines */}
			<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

			<div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 relative z-10">
				<div class="flex items-center gap-5">
					<div class="p-3 bg-primary/10 border border-primary/30 rounded-sm">
						<MailIcon size={24} class="text-primary animate-pulse" />
					</div>
					<div>
						<h2 class="text-3xl font-black text-white tracking-tighter uppercase italic selection:bg-primary selection:text-black">
							{">"} {t("dashboard.inbox.title")}
						</h2>
						<div class="flex items-center gap-3 mt-1">
							<span class="text-[9px] text-primary font-mono uppercase tracking-[0.4em]">
								{t("dashboard.inbox.protocol")}
							</span>
							<span class="w-1 h-1 bg-white/20 rounded-full" />
							<span class="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.4em]">
								{t("dashboard.inbox.active")}
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-6 bg-zinc-950/60 p-4 rounded-sm border border-white/5 backdrop-blur-md">
					<div class="flex flex-col items-end">
						<div class="flex items-center gap-2 text-[8px] font-mono text-primary font-black tracking-widest uppercase mb-1">
							<WifiIcon size={10} />
							<span>{t("dashboard.inbox.node")}</span>
						</div>
						<span class="text-[10px] font-mono text-white font-bold tracking-widest uppercase opacity-60">
							ADMIN_GATEWAY_v1
						</span>
					</div>
					<div class="h-10 w-px bg-white/5" />
					<div class="p-2 bg-primary/5 rounded-full border border-primary/20">
						<ShieldCheckIcon size={16} class="text-primary" />
					</div>
				</div>
			</div>

			{/* MessageList handles the Master-Detail view internally */}
			<div class="flex-1 overflow-hidden relative z-10  bg-zinc-950/20 border border-white/5 rounded-sm transition-all hover:border-primary/10">
				<div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
				<MessageList lang={params.lang} />
			</div>
		</div>
	);
}
