import {
	Activity,
	Bell,
	Cpu,
	Search,
	ShieldCheckIcon,
	WifiIcon,
} from "lucide-preact";

export default function DashboardHeader() {
	return (
		<header class="h-16 border-b border-white/5 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
			{/* Ambient Artifact */}
			<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

			{/* Left: Breadcrumbs / System Identity */}
			<div class="flex items-center gap-6 relative z-10">
				<div class="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
					<div class="w-2 h-2 rounded-full bg-primary/20 border border-primary/40 shadow-glow animate-pulse" />
					<span class="text-white font-black group hover:text-primary transition-colors cursor-pointer">
						SYS_ROOT
					</span>
					<span class="opacity-20">/</span>
					<span class="text-primary/80 font-bold">RAG_PROTOCOL_INIT</span>
					<span class="opacity-20">/</span>
					<span class="animate-pulse">_</span>
				</div>
			</div>

			{/* Right: Actions & Status Panels */}
			<div class="flex items-center gap-8 relative z-10">
				{/* System Status Indicators */}
				<div class="hidden lg:flex items-center gap-6 px-5 py-2 bg-black/40 border border-white/5 rounded-sm relative overflow-hidden group hover:border-primary/20 transition-all">
					<div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-2 text-[8px] text-primary text-glow font-black tracking-widest uppercase">
							<Activity size={10} class="animate-pulse" />
							<span>STATUS: ONLINE</span>
						</div>
						<div class="flex items-center gap-2 text-[8px] text-muted-foreground font-bold tracking-widest uppercase opacity-60">
							<WifiIcon size={10} />
							<span>LATENCY: 12ms</span>
						</div>
					</div>

					<div class="w-px h-6 bg-white/5" />

					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-2 text-[8px] text-white tracking-widest uppercase font-bold">
							<Cpu size={10} />
							<span>LOAD: 12.4%</span>
						</div>
						<div class="flex items-center gap-2 text-[8px] text-muted-foreground font-bold tracking-widest uppercase opacity-60">
							<ShieldCheckIcon size={10} />
							<span>SECURE_LINK</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<button
						type="button"
						aria-label="Search System"
						class="w-9 h-9 flex items-center justify-center rounded-sm bg-white/5 border border-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all group"
					>
						<Search
							size={16}
							class="group-hover:scale-110 transition-transform"
						/>
					</button>

					<div class="relative">
						<button
							type="button"
							aria-label="Notifications"
							class="w-9 h-9 flex items-center justify-center rounded-sm bg-white/5 border border-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all group"
						>
							<Bell
								size={16}
								class="group-hover:scale-110 transition-transform"
							/>
						</button>
						<span class="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-ping shadow-glow" />
					</div>
				</div>

				<div class="h-8 w-px bg-white/5 mx-2" />

				<div class="flex items-center gap-4 group cursor-pointer">
					<div class="flex flex-col items-end hidden sm:flex">
						<span class="text-[10px] font-black tracking-[0.2em] uppercase text-white group-hover:text-primary transition-colors">
							DEV_ADMIN
						</span>
						<span class="text-[8px] text-primary/60 font-bold tracking-widest uppercase">
							SYS.ONLINE
						</span>
					</div>
					<div class="w-10 h-10 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center overflow-hidden relative group-hover:border-primary transition-colors">
						<div class="absolute inset-0 bg-scanline opacity-20" />
						<div class="w-full h-full bg-linear-to-tr from-primary/40 to-transparent group-hover:scale-110 transition-transform duration-500" />
						{/* Mock Avatar */}
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="w-6 h-6 rounded-full border border-primary/40 bg-zinc-950 flex items-center justify-center">
								<span class="text-[10px] text-primary font-black">A</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
