import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { useEffect, useMemo } from "preact/hooks";

export default function SystemIntro({ lang = "es" }: { lang?: Lang }) {
	const t = useTranslations(lang);

	const BOOT_LOGS = [
		{ id: "0x00A1", text: t("intro.boot.kernel"), status: "OK" },
		{ id: "0x00B4", text: t("intro.boot.filesystem"), status: "OK" },
		{ id: "0x00C7", text: t("intro.boot.cluster"), status: "OK" },
		{ id: "0x00D9", text: t("intro.boot.neural"), status: "OK" },
		{ id: "0x00E2", text: t("intro.boot.embeddings"), status: "WARN" },
		{ id: "0x00F5", text: t("intro.boot.llm"), status: "OK" },
		{ id: "0x010A", text: t("intro.boot.uplink"), status: "PENDING" },
	];

	// Helper to generate random starts
	const generateStars = (count: number) => {
		let value = "";
		for (let i = 0; i < count; i++) {
			const x = Math.floor(Math.random() * 2000);
			const y = Math.floor(Math.random() * 2000);
			value += `${x}px ${y}px #FFF, `;
		}
		return value.slice(0, -2);
	};

	/* Moved BOOT_LOGS inside component to access t() */
	const isVisible = useSignal(true);
	const bootProgress = useSignal(0);
	const currentLogIndex = useSignal(0);
	const isFading = useSignal(false);

	const smallStars = useMemo(() => generateStars(700), []);
	const mediumStars = useMemo(() => generateStars(200), []);
	const bigStars = useMemo(() => generateStars(100), []);

	useEffect(() => {
		// Prevent scroll while booting
		document.body.style.overflow = "hidden";

		const interval = setInterval(() => {
			if (bootProgress.value < 100) {
				bootProgress.value += Math.random() * 5;
				if (bootProgress.value > 100) bootProgress.value = 100;
			}

			if (currentLogIndex.value < BOOT_LOGS.length - 1 && Math.random() > 0.7) {
				currentLogIndex.value++;
			}

			if (bootProgress.value === 100) {
				clearInterval(interval);
				setTimeout(() => {
					isFading.value = true;
					setTimeout(() => {
						isVisible.value = false;
						document.body.style.overflow = ""; // Restore scroll
					}, 800); // Fade duration
				}, 1000);
			}
		}, 80); // Slightly faster boot

		return () => clearInterval(interval);
	}, []);

	if (!isVisible.value) return null;

	return (
		<div
			class={cn(
				"fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono overflow-hidden transition-opacity duration-1000",
				isFading.value ? "opacity-0 pointer-events-none" : "opacity-100",
			)}
		>
			<style>{`
				@keyframes animStar {
					from { transform: translateY(0px); }
					to { transform: translateY(-2000px); }
				}
			`}</style>

			{/* Minimal Tech Background Layers */}
			<div class="absolute inset-0 pointer-events-none">
				{/* Small Central Tech Glow - "Solo una parte" */}
				<div class="absolute inset-0 bg-[radial-gradient(circle_500px_at_center,rgba(6,182,212,0.15),transparent)]" />

				{/* Subtle Tech Grid Lines */}
				<div
					class="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			{/* Space Stars (Masked to Center) */}
			<div
				class="absolute inset-0 overflow-hidden pointer-events-none"
				style={{
					maskImage:
						"radial-gradient(circle at center, black 40%, transparent 100%)",
					WebkitMaskImage:
						"radial-gradient(circle at center, black 40%, transparent 100%)",
				}}
			>
				<div
					class="w-[1px] h-px bg-transparent absolute top-0 left-0"
					style={{
						boxShadow: smallStars,
						animation: "animStar 50s linear infinite",
					}}
				/>
				<div
					class="w-[2px] h-[2px] bg-transparent absolute top-0 left-0"
					style={{
						boxShadow: mediumStars,
						animation: "animStar 100s linear infinite",
					}}
				/>
				<div
					class="w-[3px] h-[3px] bg-transparent absolute top-0 left-0"
					style={{
						boxShadow: bigStars,
						animation: "animStar 150s linear infinite",
					}}
				/>
			</div>

			{/* Matrix/Scanline Overlay */}
			<div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />

			{/* Vignette */}
			<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-transparent via-black/40 to-black opacity-90" />

			<div class="z-10 w-full max-w-2xl px-6 flex flex-col gap-8">
				{/* Header */}
				<div class="space-y-2 text-center">
					<h2 class="text-3xl md:text-4xl font-black text-white tracking-widest animate-pulse">
						{t("intro.system_boot")}
					</h2>
					<p class="text-[10px] text-primary/60 tracking-[0.5em] font-bold uppercase">
						{t("intro.initializing")}
					</p>
				</div>

				{/* Logs */}
				<div class="h-48 border border-white/10 bg-black/50 backdrop-blur-sm p-6 rounded-sm space-y-2 overflow-hidden flex flex-col justify-end">
					{BOOT_LOGS.slice(0, currentLogIndex.value + 1).map((log) => (
						<div
							key={log.id}
							class="flex justify-between items-center text-xs md:text-sm"
						>
							<div class="flex gap-4">
								<span class="text-zinc-600">{log.id}</span>
								<span class="text-zinc-300">&gt; {log.text}</span>
							</div>
							<span
								class={cn(
									"font-bold text-[10px]",
									log.status === "OK"
										? "text-emerald-500"
										: log.status === "WARN"
											? "text-amber-500"
											: "text-primary animate-pulse",
								)}
							>
								[ {log.status} ]
							</span>
						</div>
					))}
				</div>

				{/* Progress Bar */}
				<div class="space-y-4">
					<div class="flex justify-between items-center text-[10px] tracking-widest uppercase font-bold">
						<span class="text-zinc-500">{t("intro.loading_modules")}</span>
						<span class="text-primary">{Math.round(bootProgress.value)}%</span>
					</div>
					<div class="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
						<div
							class="h-full bg-primary shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-100 ease-linear"
							style={{ width: `${bootProgress.value}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Bottom Info */}
			<div class="absolute bottom-8 text-[9px] text-zinc-600 tracking-[0.3em] uppercase">
				{t("intro.secure_connection")}
			</div>
		</div>
	);
}
