import { useEntranceAnimation } from "@hooks/use-motion";
import { type Lang, useTranslations } from "@src/i18n";
import { audioStore } from "@stores/audio.store";
import {
	Code,
	Github,
	Linkedin,
	MessageCircle,
	Twitter,
	Youtube,
} from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import TypedMessage from "./special/typed-message";

interface HeroTerminalProps {
	lang?: Lang;
	socials?: {
		linkedin: string | null;
		github: string | null;
		twitter: string | null;
		youtube: string | null;
		whatsapp: string | null;
	} | null;
}

export default function HeroTerminal({
	lang = "es",
	socials,
}: HeroTerminalProps) {
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
		<div
			ref={containerRef}
			class="relative w-full py-4 flex flex-col items-center justify-center"
		>
			{/* Reactive Background Glow */}
			<div
				ref={glowRef}
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10 transition-transform duration-75 ease-linear will-change-transform"
			/>

			<div class="z-10 w-full max-w-4xl px-4">
				{/* Window Frame */}
				<div class="bg-black/60 border border-white/10 rounded-sm shadow-2xl backdrop-blur-md overflow-hidden relative group min-h-[auto] md:min-h-[450px]">
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
							<span class="text-[9px] md:text-[10px] text-muted-foreground font-mono uppercase tracking-widest ml-4 truncate">
								root@system:~/init
							</span>
						</div>
					</div>

					{/* Content */}
					<div class="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col gap-6 relative z-10 font-mono">
						{/* Hero Content UI */}
						<div class="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
							{/* Header Row: Title + HUD Modules */}
							<div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-4 mb-8">
								{/* Left: Title & Badge */}
								<div class="space-y-2 flex-1">
									<TypedMessage
										message={t("home.hero.badge")}
										delay={500}
										loop={true}
										className="mb-4 !relative !left-0 !translate-x-0"
										textClassName="text-[8px] md:text-[9px] lg:text-[10px] !tracking-[0.1em]"
									/>
									<h1 class="text-2xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-tight break-all md:break-normal uppercase">
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
										{t("home.hero.desc0")}{" "}
										<span class="text-foreground">
											{t("home.hero.desc0_highlight")}
										</span>{" "}
										{t("home.hero.desc0_end")}
									</span>
								</p>
								<p class="flex items-center flex-wrap gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc1")}{" "}
										<span class="text-foreground">
											{t("home.hero.desc1_highlight")}
										</span>{" "}
										{t("home.hero.desc1_end")}
									</span>
								</p>
								<p class="flex items-center flex-wrap gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc2")}{" "}
										<span class="text-foreground">
											{t("home.hero.desc2_highlight")}
										</span>
										{t("home.hero.desc2_end")}
									</span>
								</p>
								<p class="flex items-center flex-wrap gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc3")}{" "}
										<span class="text-foreground">
											{t("home.hero.desc3_highlight")}
										</span>
										{t("home.hero.desc3_end")}
									</span>
								</p>
								<p class="opacity-40 text-[10px] mt-4">
									{t("home.hero.stack")}
								</p>
							</div>

							{/* Buttons & Socials */}
							<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mt-8 md:mt-12">
								<div class="flex flex-wrap gap-4">
									<a
										href={
											socials?.whatsapp
												? socials.whatsapp.startsWith("http")
													? socials.whatsapp
													: `https://wa.me/${socials.whatsapp.replace(/\D/g, "")}`
												: "#"
										}
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Start Project"
										class="px-6 md:px-8 py-3 bg-primary text-primary-foreground font-bold text-[10px] md:text-[11px] tracking-widest uppercase hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 flex items-center justify-center gap-3 group"
									>
										<MessageCircle size={16} className="animate-pulse" />
										{t("home.hero.execute")}
									</a>
									<a
										href="https://github.com/VigilioYonatan/PORTAFOLIO"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="View Source Code"
										class="px-6 md:px-8 py-3 bg-zinc-900 border border-white/10 text-white font-bold text-[10px] md:text-[11px] tracking-widest uppercase hover:bg-white/5 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 group"
									>
										<Code size={16} />
										{t("home.hero.view_code")}
									</a>
								</div>

								{/* Social Links */}
								<div class="flex items-center gap-6">
									{socials?.github && (
										<a
											href={socials.github}
											target="_blank"
											rel="noopener noreferrer"
											class="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 border border-white/5 hover:border-primary/20 bg-white/5 rounded-sm group relative"
											aria-label="GitHub Profile"
										>
											<Github size={18} />
											<span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
												GitHub
											</span>
										</a>
									)}
									{socials?.linkedin && (
										<a
											href={socials.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											class="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 border border-white/5 hover:border-primary/20 bg-white/5 rounded-sm group relative"
											aria-label="LinkedIn Profile"
										>
											<Linkedin size={18} />
											<span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
												LinkedIn
											</span>
										</a>
									)}
									{socials?.twitter && (
										<a
											href={socials.twitter}
											target="_blank"
											rel="noopener noreferrer"
											class="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 border border-white/5 hover:border-primary/20 bg-white/5 rounded-sm group relative"
											aria-label="Twitter Profile"
										>
											<Twitter size={18} />
											<span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
												Twitter
											</span>
										</a>
									)}
									{socials?.youtube && (
										<a
											href={socials.youtube}
											target="_blank"
											rel="noopener noreferrer"
											class="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 border border-white/5 hover:border-primary/20 bg-white/5 rounded-sm group relative"
											aria-label="YouTube Channel"
										>
											<Youtube size={18} />
											<span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
												YouTube
											</span>
										</a>
									)}
									{socials?.whatsapp && (
										<a
											href={socials.whatsapp}
											target="_blank"
											rel="noopener noreferrer"
											class="text-muted-foreground hover:text-green-500 transition-all hover:scale-110 p-2 border border-white/5 hover:border-green-500/20 bg-white/5 rounded-sm group relative"
											aria-label="WhatsApp"
										>
											<MessageCircle size={18} />
											<span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
												WhatsApp
											</span>
										</a>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
