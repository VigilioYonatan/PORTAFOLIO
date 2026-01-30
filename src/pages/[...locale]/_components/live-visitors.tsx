import { useSignal } from "@preact/signals";
import { Users } from "lucide-preact";
import { useEffect } from "preact/hooks";

interface LiveVisitorsProps {
	initialCount: number;
}

export default function LiveVisitors({ initialCount }: LiveVisitorsProps) {
	const count = useSignal<number>(initialCount);

	useEffect(() => {
		// Just a small frontend fluctuation to make it feel alive
		// without needing more backend calls
		const interval = setInterval(() => {
			const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
			const newCount = count.value + change;
			// Keep it within a reasonable range around initial
			count.value = Math.max(
				initialCount - 10,
				Math.min(initialCount + 10, newCount),
			);
		}, 5000);

		return () => clearInterval(interval);
	}, [initialCount]);

	if (count.value === 0) return null;

	return (
		<div class="fixed bottom-4 right-84 z-40 hidden xl:flex items-center gap-2 px-3 py-2 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-wider shadow-lg group hover:border-primary/30 transition-all">
			<div class="relative flex items-center justify-center">
				<span class="absolute w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
				<span class="relative w-2 h-2 bg-green-500 rounded-full" />
			</div>
			<Users size={12} class="text-primary" />
			<span class="text-white/70 group-hover:text-white transition-colors">
				<span class="text-primary font-bold">{count.value}</span> online
			</span>
		</div>
	);
}
