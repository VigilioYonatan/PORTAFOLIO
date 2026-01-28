import { useSignal } from "@preact/signals";
import { UsersIcon } from "lucide-preact";
import { useEffect } from "preact/hooks";

export default function ActiveUsersStat() {
	// Initial random value between 80 and 120
	const userCount = useSignal(Math.floor(Math.random() * (120 - 80 + 1)) + 80);

	useEffect(() => {
		const interval = setInterval(() => {
			// New random value between 80 and 120
			userCount.value = Math.floor(Math.random() * (120 - 80 + 1)) + 80;
		}, 15000); // 15 seconds

		return () => clearInterval(interval);
	}, []);

	return (
		<div class="flex flex-col gap-1">
			<div class="flex justify-between items-center mb-1">
				<span class="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 uppercase tracking-wider">
					<UsersIcon size={10} />
					Active_Users
				</span>
				<span class="text-[10px] text-green-400 font-mono animate-pulse">
					{userCount.value}
				</span>
			</div>
			<div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
				<div
					class="h-full bg-green-400 transition-all duration-[2000ms] ease-out"
					style={{ width: `${(userCount.value / 150) * 100}%` }}
				/>
			</div>
		</div>
	);
}
