import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export default function LiveSidebarStats() {
	const integrity = useSignal(100);
	const latency = useSignal(12);

	useEffect(() => {
		const interval = setInterval(() => {
			// Fluctuate integrity rarely (98-100%)
			if (Math.random() > 0.9) {
				integrity.value = Math.random() > 0.5 ? 100 : 99;
			}

			// Fluctuate latency often (8-24ms)
			latency.value = Math.floor(8 + Math.random() * 16);
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div class="px-6 py-4 space-y-4 border-t border-white/5 font-mono">
			<div class="space-y-1">
				<div class="flex justify-between text-[8px] text-muted-foreground/60 tracking-widest uppercase">
					<span>SYS_INTEGRITY</span>
					<span
						class={integrity.value === 100 ? "text-primary" : "text-yellow-500"}
					>
						{integrity.value}%
					</span>
				</div>
				<div class="h-0.5 bg-zinc-900 overflow-hidden">
					<div
						class="h-full bg-primary/40 w-full transition-all duration-1000"
						style={{
							width: `${integrity.value}%`,
							opacity: integrity.value / 100,
						}}
					/>
				</div>
			</div>
			<div class="space-y-1">
				<div class="flex justify-between text-[8px] text-muted-foreground/60 tracking-widest uppercase">
					<span>NET_LATENCY</span>
					<span class="text-sky-400">{latency.value}ms</span>
				</div>
				<div class="h-0.5 bg-zinc-900 overflow-hidden">
					<div
						class="h-full bg-sky-400/40 transition-all duration-500"
						style={{ width: `${Math.min(100, latency.value)}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
