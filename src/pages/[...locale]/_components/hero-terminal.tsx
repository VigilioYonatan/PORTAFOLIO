import { useEntranceAnimation } from "@hooks/use-motion";
import { audioStore } from "@stores/audio.store";
import { useEffect, useRef } from "preact/hooks";
import { type Lang, useTranslations } from "@src/i18n";

interface HeroTerminalProps {
    lang?: Lang;
}

export default function HeroTerminal({ lang = "es" }: HeroTerminalProps) {
	const containerRef = useEntranceAnimation(0.2);
	const { bassIntensity, beatDetected } = audioStore.state;
	const glowRef = useRef<HTMLDivElement>(null);
    const t = useTranslations(lang);

	// Removed internal boot logic as it is now handled by Global SystemIntro

	useEffect(() => {
		const updateGlow = () => {
			if (glowRef.current) {
				const intensity = bassIntensity.value;
				const scale = 1 + intensity * 0.05;
				// Adjusted opacity for ready state
				const opacity = 0.3 + intensity * 0.7;
				glowRef.current.style.transform = `scale(${scale})`;
				glowRef.current.style.opacity = String(opacity);

				if (beatDetected.value) {
					glowRef.current.style.filter = `blur(${30 + intensity * 60}px) brightness(2)`;
				} else {
					glowRef.current.style.filter = "blur(40px)";
				}
			}
			requestAnimationFrame(updateGlow);
		};
		const id = requestAnimationFrame(updateGlow);
		return () => cancelAnimationFrame(id);
	}, [bassIntensity, beatDetected]);

	return (
		<section
			ref={containerRef}
			class="relative w-full py-8 md:py-12 flex flex-col items-center justify-center overflow-hidden min-h-[500px] md:min-h-[600px]"
		>
			{/* Reactive Background Glow */}
			<div
				ref={glowRef}
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10 transition-transform duration-75 ease-linear will-change-transform"
			/>

			<div class="z-10 w-full max-w-4xl px-4">
				{/* Window Frame */}
				<div class="bg-black/60 border border-white/10 rounded-sm shadow-2xl backdrop-blur-md overflow-hidden relative group min-h-[400px] md:min-h-[450px]">
					{/* Scanline inside window */}
					<div class="absolute inset-0 bg-scanline opacity-[0.05] pointer-events-none" />

					{/* Title Bar */}
					<div class="h-8 border-b border-white/10 flex items-center px-4 justify-between bg-zinc-950/40 relative z-20">
						<div class="flex items-center gap-2">
							<div class="flex gap-1.5">
								<div class="w-2.5 h-2.5 rounded-full bg-primary border border-primary/40 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
								<div class="w-2.5 h-2.5 rounded-full bg-zinc-700" />
								<div class="w-2.5 h-2.5 rounded-full bg-zinc-700" />
							</div>
							<span class="text-[10px] text-muted-foreground font-mono uppercase tracking-widest ml-4">
								root@system:~/init
							</span>
						</div>
					</div>

					{/* Content */}
					<div class="p-4 md:p-8 lg:p-12 flex flex-col gap-6 relative z-10 font-mono">
						{/* Hero Content UI */}
						<div class="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
							{/* Header Row: Title + HUD Modules */}
							<div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-4 mb-8">
								{/* Left: Title & Badge */}
								<div class="space-y-2 flex-1">
									<div class="p-1 px-3 bg-primary/10 border border-primary/20 inline-block rounded-sm">
										<span class="text-[9px] font-bold text-primary tracking-[0.3em] uppercase">
											{t("home.hero.badge")}
										</span>
									</div>
									<h1 class="text-2xl md:text-6xl lg:text-8xl font-black tracking-tighter text-white leading-none break-all md:break-normal">
										{t("home.hero.software")}
										<br />
										<span
											class="text-primary text-glow transition-all duration-75"
											style={{
												textShadow: `0 0 ${20 + bassIntensity.value * 40}px rgba(6,182,212,0.6)`,
											}}
										>
											{t("home.hero.engineer")}
										</span>
									</h1>
								</div>
							</div>

							<div class="space-y-2 font-mono text-xs md:text-sm text-muted-foreground mt-6">
								<p class="flex items-center flex-wrap gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc1")}{" "}
										<span class="text-foreground">{t("home.hero.desc1_highlight")}</span>{" "}
										{t("home.hero.desc1_end")}
									</span>
								</p>
								<p class="flex items-center flex-wrap gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc2")}{" "}
										<span class="text-foreground">{t("home.hero.desc2_highlight")}</span>
										{t("home.hero.desc2_end")}
									</span>
								</p>
								<p class="opacity-40 text-[10px] mt-4">
									{t("home.hero.stack")}
								</p>
							</div>

							{/* Buttons */}
							<div class="flex flex-wrap gap-4 mt-8">
								<button
									type="button"
									aria-label="Execute Protocol"
									class="px-8 py-3 bg-primary text-primary-foreground font-bold text-[11px] tracking-widest uppercase hover:bg-primary/90 transition-all shadow-(0_0_20px_rgba(6,182,212,0.3)) active:scale-95 flex items-center gap-3 group"
								>
									<div class="w-3 h-3 border-2 border-primary-foreground rounded-full border-t-transparent animate-spin-slow group-hover:animate-spin" />
									{t("home.hero.execute")}
								</button>
								<button
									type="button"
									aria-label="View Source Code"
									class="px-8 py-3 bg-transparent border border-white/20 text-white font-bold text-[11px] tracking-widest uppercase hover:bg-white/5 transition-all active:scale-95 flex items-center gap-3"
								>
									<span class="text-white/40">&lt; &gt;</span>
									{t("home.hero.source")}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
