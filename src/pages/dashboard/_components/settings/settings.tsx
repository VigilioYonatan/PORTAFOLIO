import AdminCard from "@modules/portfolio-config/components/admin-card";
import ThemeCustomizer from "@modules/portfolio-config/components/theme-customizer";
import { type Lang, useTranslations } from "@src/i18n";
import { CogIcon, Palette, ShieldIcon, SlidersIcon } from "lucide-preact";

interface SettingsProps {
	params: {
		lang: Lang;
	};
}

export default function Settings({ params }: SettingsProps) {
	const t = useTranslations(params.lang);
	return (
		<div class="space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto relative pb-20">
			{/* Ambient System Scanlines */}
			<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

			<div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10 relative z-10">
				<div class="flex items-center gap-5">
					<div class="p-4 bg-primary/10 border border-primary/30 rounded-sm">
						<CogIcon size={28} class="text-primary animate-spin-slow" />
					</div>
					<div>
						<h2 class="text-4xl font-black text-white tracking-tighter uppercase italic">
							{">"} {t("dashboard.settings.title")}
						</h2>
						<div class="flex items-center gap-3 mt-1">
							<span class="text-[10px] text-primary font-mono uppercase tracking-[0.4em]">
								{t("dashboard.settings.node_params")}
							</span>
							<span class="w-1 h-1 bg-white/20 rounded-full" />
							<span class="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.4em]">
								{t("dashboard.settings.global_overfit")}
							</span>
						</div>
					</div>
				</div>

				<div class="hidden lg:flex items-center gap-4 px-5 py-2 bg-black/40 border border-white/5 rounded-sm">
					<SlidersIcon size={14} class="text-primary/60" />
					<span class="text-[9px] font-black tracking-[0.3em] text-zinc-500">
						{t("dashboard.settings.opt_level")}
					</span>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-12 relative z-10">
				{/* Profile / Auth Section */}
				<section class="space-y-6">
					<div class="flex items-center justify-between border-b border-white/10 pb-4">
						<div class="flex items-center gap-3">
							<ShieldIcon class="text-primary animate-pulse" size={20} />
							<h3 class="text-sm font-black tracking-[0.3em] text-white uppercase italic">
								{t("dashboard.settings.neural_link")}
							</h3>
						</div>
						<span class="text-[8px] text-primary/40 font-mono">
							{t("dashboard.settings.secure_layer")}
						</span>
					</div>
					<div class="hover:border-primary/20 transition-all rounded-sm">
						<AdminCard lang={params.lang} />
					</div>
				</section>

				{/* Appearance Section */}
				<section class="space-y-6">
					<div class="flex items-center justify-between border-b border-white/10 pb-4">
						<div class="flex items-center gap-3">
							<Palette class="text-primary" size={20} />
							<h3 class="text-sm font-black tracking-[0.3em] text-white uppercase italic">
								{t("dashboard.settings.aesthetic")}
							</h3>
						</div>
						<span class="text-[8px] text-primary/40 font-mono">
							{t("dashboard.settings.core_ui")}
						</span>
					</div>
					<div class="bg-zinc-950/40 p-1 border border-white/5 rounded-sm hover:border-primary/10 transition-all">
						<ThemeCustomizer lang={params.lang} />
					</div>
				</section>
			</div>
		</div>
	);
}
