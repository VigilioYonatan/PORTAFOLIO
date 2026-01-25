import { Palette, Settings as SettingsIcon, ShieldIcon, CogIcon, SlidersIcon } from "lucide-preact";
import AdminCard from "@modules/portfolio-config/components/AdminCard";
import ThemeCustomizer from "@modules/portfolio-config/components/ThemeCustomizer";

export default function Settings() {
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
					    <h2 class="text-4xl font-black font-mono text-white tracking-tighter uppercase italic">
						    {">"} SYSTEM_CONFIG_v4.2.0
					    </h2>
					    <div class="flex items-center gap-3 mt-1">
                            <span class="text-[10px] text-primary font-bold font-mono uppercase tracking-[0.4em]">Node_Parameters</span>
                            <span class="w-1 h-1 bg-white/20 rounded-full" />
                            <span class="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.4em]">Global_Override_Active</span>
                        </div>
                    </div>
				</div>

                <div class="hidden lg:flex items-center gap-4 px-5 py-2 bg-black/40 border border-white/5 rounded-sm">
                    <SlidersIcon size={14} class="text-primary/60" />
                    <span class="text-[9px] font-black font-mono tracking-[0.3em] text-zinc-500">OPTIMIZATION_LEVEL: MAXIMUM</span>
                </div>
			</div>

			<div class="grid grid-cols-1 gap-12 relative z-10">
				{/* Profile / Auth Section */}
				<section class="space-y-6">
					<div class="flex items-center justify-between border-b border-white/10 pb-4">
						<div class="flex items-center gap-3">
						    <ShieldIcon class="text-primary animate-pulse" size={20} />
						    <h3 class="text-sm font-black font-mono tracking-[0.3em] text-white uppercase italic">Admin_Neural_Link</h3>
					    </div>
                        <span class="text-[8px] text-primary/40 font-mono">SECURE_AUTH_LAYER</span>
					</div>
					<div class="hover:border-primary/20 transition-all rounded-sm">
                        <AdminCard />
                    </div>
				</section>

				{/* Appearance Section */}
				<section class="space-y-6">
					<div class="flex items-center justify-between border-b border-white/10 pb-4">
						<div class="flex items-center gap-3">
						    <Palette class="text-primary" size={20} />
						    <h3 class="text-sm font-black font-mono tracking-[0.3em] text-white uppercase italic">Aesthetic_Orchestration</h3>
					    </div>
                        <span class="text-[8px] text-primary/40 font-mono">UI_CORE_RENDERING</span>
					</div>
					<div class="bg-zinc-950/40 p-1 border border-white/5 rounded-sm hover:border-primary/10 transition-all">
                        <ThemeCustomizer />
                    </div>
				</section>
			</div>
		</div>
	);
}
