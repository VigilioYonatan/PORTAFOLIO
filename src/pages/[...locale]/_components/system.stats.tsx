import { useSignal } from "@preact/signals";
import { audioStore } from "@stores/audio.store";
import {
	ActivityIcon,
	CpuIcon,
	DatabaseIcon,
	NetworkIcon,
	ShieldCheckIcon,
} from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import { useTranslations } from "@src/i18n";

export default function SystemStats({ lang = "es" }: { lang?: string }) {
    const t = useTranslations(lang as any);
	const { bassIntensity, midIntensity } = audioStore.state;
	const cpuLoad = useSignal(0);
	const memLoad = useSignal(0);
	const uptime = useSignal("00:00:00:00");
	const latency = useSignal(0);
	const modelName = useSignal("INITIALIZING...");

	// Uptime Logic - track client side drift + server base
	const startTime = useRef(Date.now());

	useEffect(() => {
		// Client Side Stats (Available APIs)
		// Note: Browsers block real hardware stats for privacy/fingerprinting.
		// We use what's available and simulate the "live" feel for the cyber-aesthetic.

		const updateStats = () => {
			// 1. CPU: Logical Cores
			const concurrency = navigator.hardwareConcurrency || 4; // Default to 4 if unknown

			// 2. RAM: Device Memory (approx GB) - Experimental API (Chrome/Edge)
			const ramValues = (navigator as any).deviceMemory
				? (navigator as any).deviceMemory
				: 8; // Fallback

			// 3. System Info
			// userAgent contains: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."
			// We can parse a friendly name
			const platform = navigator.platform || "Unknown";
			const ua = navigator.userAgent;
			let osName = "TERMINAL_CL";
			if (ua.indexOf("Win") !== -1) osName = "WINDOWS_SYS";
			if (ua.indexOf("Mac") !== -1) osName = "MACOS_KERNEL";
			if (ua.indexOf("Linux") !== -1) osName = "LINUX_CORE";
			if (ua.indexOf("Android") !== -1) osName = "ANDROID_OS";
			if (ua.indexOf("like Mac") !== -1) osName = "IOS_MOBILE";

			modelName.value = `${osName} :: ${concurrency} CORES`;

			// 4. Simulated "Live" Activity
			// Since we can't read real CPU usage, we create a "heartbeat" effect
			// random fluctuation to look alive
			const drift = (Math.random() - 0.5) * 5; // +/- 2.5%
			let newCpu = cpuLoad.value + drift;
			if (newCpu < 5) newCpu = 5;
			if (newCpu > 30) newCpu = 30; // Idle browser rarely uses > 30% of total system
			cpuLoad.value = newCpu;

			// Memory simulation (random stable base)
			// Chrome performance.memory is generic and often bucketed
			const memBase = (ramValues / 32) * 100; // Just a visual scale relative to "32GB max"
			const memDrift = (Math.random() - 0.5) * 0.5;
			memLoad.value = Math.max(10, Math.min(90, memBase * 10 + 20 + memDrift)); // Fake scale

			latency.value = Math.floor(Math.random() * 20) + 5; // Simulated internal latency
		};

		const interval = setInterval(() => {
			updateStats();

			// Uptime Counter (Session)
			const now = Date.now();
			const diff = now - startTime.current;
			const hrs = Math.floor(diff / 3600000);
			const mins = Math.floor((diff % 3600000) / 60000);
			const secs = Math.floor((diff % 60000) / 1000);
			const ms = Math.floor((diff % 1000) / 10);
			uptime.value = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${ms.toString().padStart(2, "0")}`;
		}, 1000);

		// Initial set
		updateStats();

		return () => clearInterval(interval);
	}, []);

	return (
		<div class="flex flex-col gap-6 font-mono text-[10px] text-muted-foreground/80 p-5 border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
			{/* Ambient Artifact */}
			<div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />

			<div class="flex justify-between items-center border-b border-white/10 pb-3 relative z-10">
				<div class="flex items-center gap-2">
					<ActivityIcon size={12} class="text-primary animate-pulse" />
					<span class="tracking-[0.4em] uppercase font-black text-white">
						{t("stats.core_telemetry")}
					</span>
				</div>
				<span class="text-primary/60 font-bold border border-primary/20 px-1.5 py-0.5 rounded-[2px] bg-primary/5">
					NODE_ALPHA_v4
				</span>
			</div>

			<div class="space-y-6 relative z-10">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2 group/item">
						<span class="text-[8px] font-black text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
							<CpuIcon
								size={10}
								class="text-primary/40 group-hover/item:text-primary transition-colors"
							/>
							{t("stats.processor")}
						</span>
						<span
							class="text-white font-bold block bg-white/5 p-1 rounded-sm border border-white/5 text-[9px] truncate"
							title={modelName.value}
						>
							{modelName.value}
						</span>
					</div>
					<div class="space-y-2 group/item">
						<span class="text-[8px] font-black text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
							<DatabaseIcon
								size={10}
								class="text-primary/40 group-hover/item:text-primary transition-colors"
							/>
							{t("stats.storage")}
						</span>
						<span class="text-white font-bold block bg-white/5 p-1 rounded-sm border border-white/5">
							NVME_GEN4_R6500_W5000
						</span>
					</div>
				</div>

				<div class="space-y-4">
					<div class="space-y-2">
						<div class="flex justify-between items-end uppercase tracking-widest">
							<span class="text-[8px] font-black text-zinc-400">
								{t("stats.memory")}
							</span>
							<span class="text-primary font-black text-[11px]">
								{memLoad.value.toFixed(1)}%
							</span>
						</div>
						<div class="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
							<div
								class="h-full bg-primary/60 transition-all duration-1000 shadow-glow"
								style={{ width: `${memLoad.value}%` }}
							/>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between items-end uppercase tracking-widest">
							<span class="text-[8px] font-black text-zinc-400">
								{t("stats.compute")}
							</span>
							<span class="text-white font-black text-[11px]">
								{cpuLoad.value.toFixed(1)}%
							</span>
						</div>
						<div class="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
							<div
								class="h-full bg-white/40 transition-all duration-300"
								style={{ width: `${cpuLoad.value}%` }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Audio Reactive Neural Status */}
			<div class="mt-2 p-3 border border-primary/20 bg-primary/5 rounded-sm flex items-center justify-between group overflow-hidden relative backdrop-blur-sm">
				<div class="absolute inset-x-0 bottom-0 h-[1px] bg-primary/40 animate-shimmer" />

				<div class="flex items-center gap-3 relative z-10">
					<ShieldCheckIcon size={14} class="text-primary animate-pulse" />
					<div class="flex flex-col">
						<span class="text-[10px] tracking-[0.2em] text-primary font-black uppercase">
							{t("stats.neural_sync")}
						</span>
						<span class="text-[8px] text-primary/40 font-bold uppercase tracking-widest">
							{t("stats.latency")}: {latency.value.toFixed(3)}ms
						</span>
					</div>
				</div>

				<div class="flex gap-[2px] items-end h-4 relative z-10 px-2 border-l border-primary/20">
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							class="w-[2px] bg-primary group-hover:bg-white transition-colors duration-500"
							style={{
								height: `${15 + (i % 2 === 0 ? bassIntensity.value : midIntensity.value) * 85}%`,
								transition: "height 0.1s ease-out",
								transitionDelay: `${i * 15}ms`,
							}}
						/>
					))}
				</div>
			</div>

			<div class="flex items-center justify-between pt-2 border-t border-white/5 opacity-40 selection:bg-primary">
				<span class="text-[8px] tracking-[0.2em] uppercase font-bold">
					{t("stats.uptime")}: {uptime.value}
				</span>
				<NetworkIcon size={10} />
			</div>
		</div>
	);
}
