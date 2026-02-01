import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { useEffect, useMemo } from "preact/hooks";

export default function SystemIntro({ lang = "es" }: { lang?: Lang }) {
	const t = useTranslations(lang);
	const STEPS = [
		{ command: "whoami", output: "vigilio" },
		{ command: "hostname", output: "v-portfolio-node-1" },
		{
			command: "systemctl status engine.service",
			output: [
				`● engine.service - ${t("intro.terminal.description")}`,
				`   ${t("intro.terminal.active")} since ${new Date().toDateString()}`,
				`   ${t("intro.terminal.tasks")}: 42 (limit: 4915)`,
				`   ${t("intro.terminal.memory")}: 256.4M`,
			],
		},
		{
			command: "./init_session.sh",
			output: [
				t("intro.boot.kernel"),
				t("intro.boot.filesystem"),
				t("intro.boot.neural"),
				t("intro.boot.uplink"),
				t("intro.terminal.done"),
			],
		},
	];

	const isVisible = useSignal(true);
	const isFading = useSignal(false);
	const history = useSignal<{ type: "command" | "output"; text: string }[]>([]);
	const currentTyping = useSignal("");
	const stepIndex = useSignal(0);

	// Star generation (restored for atmosphere)
	const generateStars = (count: number) => {
		let value = "";
		for (let i = 0; i < count; i++) {
			const x = Math.floor(Math.random() * 2000);
			const y = Math.floor(Math.random() * 2000);
			value += `${x}px ${y}px #FFF, `;
		}
		return value.slice(0, -2);
	};

	const smallStars = useMemo(() => generateStars(700), []);
	const mediumStars = useMemo(() => generateStars(200), []);
	const bigStars = useMemo(() => generateStars(100), []);

	useEffect(() => {
		document.body.style.overflow = "hidden";

		const runTerminal = async () => {
			for (let i = 0; i < STEPS.length; i++) {
				const step = STEPS[i];

				// Type command
				const isFinalStep = i === STEPS.length - 1;
				const typingSpeed = i < 2 ? 2 : 10; // First steps very fast

				for (let j = 0; j < step.command.length; j++) {
					currentTyping.value += step.command[j];
					await new Promise((r) =>
						setTimeout(r, typingSpeed + Math.random() * 5),
					);
				}

				await new Promise((r) => setTimeout(r, i < 2 ? 20 : 150));

				history.value = [
					...history.value,
					{ type: "command", text: currentTyping.value },
				];
				currentTyping.value = "";

				const outputs = Array.isArray(step.output)
					? step.output
					: [step.output];
				for (const out of outputs) {
					await new Promise((r) => setTimeout(r, i < 2 ? 2 : 30));
					history.value = [...history.value, { type: "output", text: out }];
				}

				await new Promise((r) => setTimeout(r, isFinalStep ? 1000 : 50));
				stepIndex.value = i + 1;
			}

			await new Promise((r) => setTimeout(r, 600));
			isFading.value = true;
			await new Promise((r) => setTimeout(r, 800));
			isVisible.value = false;
			document.body.style.overflow = "";
		};

		runTerminal();
	}, []);

	if (!isVisible.value) return null;

	return (
		<div
			class={cn(
				"fixed inset-0 z-100 bg-black flex flex-col items-center justify-center font-mono overflow-hidden transition-opacity duration-1000",
				isFading.value ? "opacity-0 pointer-events-none" : "opacity-100",
			)}
		>
			<style>{`
				@keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-2000px); } }
				@keyframes flicker { 0% { opacity: 0.97; } 5% { opacity: 0.95; } 10% { opacity: 0.9; } 15% { opacity: 0.95; } 20% { opacity: 0.98; } 100% { opacity: 1; } }
				.text-glow { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
				.terminal-window { box-shadow: 0 0 50px rgba(0,0,0,0.8), inset 0 0 2px rgba(255,255,255,0.05); }
			`}</style>

			{/* 1. Atmospheric Background (Stars) */}
			<div class="absolute inset-0 pointer-events-none overflow-hidden scale-110">
				<div
					class="w-px h-px bg-transparent absolute"
					style={{
						boxShadow: smallStars,
						animation: "animStar 50s linear infinite",
					}}
				/>
				<div
					class="w-[2px] h-[2px] bg-transparent absolute"
					style={{
						boxShadow: mediumStars,
						animation: "animStar 100s linear infinite",
					}}
				/>
				<div
					class="w-[3px] h-[3px] bg-transparent absolute"
					style={{
						boxShadow: bigStars,
						animation: "animStar 150s linear infinite",
					}}
				/>
			</div>

			{/* 2. Gradient & Tech Grid Layers */}
			<div class="absolute inset-0 bg-[radial-gradient(circle_500px_at_center,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
			<div
				class="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			<div class="absolute inset-0 bg-linear-to-b from-black via-transparent to-black opacity-60 pointer-events-none" />

			{/* 3. Terminal Container */}
			<div class="z-10 w-full max-w-[95%] md:max-w-4xl bg-zinc-950/50 backdrop-blur-md border border-white/5 terminal-window rounded-lg overflow-hidden flex flex-col h-[60vh] md:h-[500px] animate-[flicker_0.15s_infinite]">
				{/* Terminal ToolBar */}
				<div class="bg-white/5 px-4 py-2.5 flex items-center justify-between border-b border-white/5">
					<div class="flex gap-1.5">
						<div class="w-3 h-3 rounded-full bg-red-500/30" />
						<div class="w-3 h-3 rounded-full bg-amber-500/30" />
						<div class="w-3 h-3 rounded-full bg-emerald-500/30" />
					</div>
					<span class="text-[10px] text-white/20 uppercase tracking-[0.3em]">
						bash — session_active
					</span>
				</div>

				{/* Terminal Content */}
				<div class="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-1 relative text-xs md:text-base">
					{/* CRT Scanline Overlay */}
					<div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />

					{history.value.map((line, i) => (
						<div key={i} class="flex flex-col">
							{line.type === "command" ? (
								<div class="flex gap-2 flex-wrap">
									<span class="text-emerald-500 font-bold text-glow">
										<span class="hidden md:inline">visitor@vigilio</span>
										<span class="md:hidden">➜</span>
									</span>
									<span class="text-zinc-500 hidden md:inline">:</span>
									<span class="text-blue-500 font-bold text-glow">~</span>
									<span class="text-zinc-100">$ {line.text}</span>
								</div>
							) : (
								<div class="text-zinc-400 pl-4 opacity-70 leading-relaxed text-[11px] md:text-[13px]">
									{line.text}
								</div>
							)}
						</div>
					))}

					{/* Active typing line */}
					{stepIndex.value < STEPS.length && (
						<div class="flex gap-2 flex-wrap">
							<span class="text-emerald-500 font-bold text-glow">
								<span class="hidden md:inline">visitor@vigilio</span>
								<span class="md:hidden">➜</span>
							</span>
							<span class="text-zinc-500 hidden md:inline">:</span>
							<span class="text-blue-500 font-bold text-glow">~</span>
							<span class="text-zinc-100 flex items-center">
								$ {currentTyping.value}
								<span class="w-2 h-4 bg-zinc-100 ml-1 animate-pulse" />
							</span>
						</div>
					)}
				</div>
			</div>

			{/* 4. Footer Info */}
			<div class="absolute bottom-8 left-0 right-0 px-8 flex justify-between items-center text-[10px] text-zinc-600 tracking-[0.2em] font-bold uppercase transition-opacity duration-1000">
				<div class="flex items-center gap-3">
					<span>{t("intro.secure_connection")}</span>
					<div class="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
				</div>
				<div class="flex gap-4">
					<span>V-PORTFOLIO_V4</span>
					<span class="opacity-30">|</span>
					<span>{lang}</span>
				</div>
			</div>

			{/* Global CRT Flicker/Vignette Overlay */}
			<div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40" />
		</div>
	);
}
