import { useEntranceAnimation } from "@hooks/use-motion";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { audioStore } from "@stores/audio.store";
import {
	Code,
	LucideGithub,
	LucideLinkedin,
	LucideTwitter,
	LucideYoutube,
	MessageCircle,
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
	const botAudioRef = useRef<HTMLAudioElement | null>(null);
	const t = useTranslations(lang);
	const isBotAnimating = useSignal(false);
	const botPos = useSignal({ x: 750, y: 350 });
	const isDragging = useSignal(false);
	const startPos = useRef({ x: 2, y: 0 });
	const initialBotPos = useRef({ x: 2, y: 0 });
	const hasMoved = useRef(false);
	const botTilt = useSignal(0);
	const lastX = useRef(0);
	const currentTechIndex = useSignal(0);

	const techIcons = [
		{ src: "/images/react-original.svg", name: "React" },
		{ src: "/images/typescript-original.svg", name: "TypeScript" },
		{ src: "/images/aws-lambda.png", name: "AWS Lambda" },
		{ src: "/images/nestjs-original.svg", name: "NestJS" },
		{ src: "/images/redis.png", name: "Redis" },
		{ src: "/images/puppeteer.png", name: "Puppeteer" },
		{ src: "/images/jest.avif", name: "Jest" },
		{ src: "/images/linux.png", name: "Linux" },
		{ src: "/images/openai.png", name: "OpenAI" },
		{ src: "/images/claude.svg", name: "Claude" },
		{ src: "/images/ollama.png", name: "Ollama" },
		{ src: "/images/aws-ecs.png", name: "AWS ECS" },
		{ src: "/images/mcp.png", name: "MCP" },
		{ src: "/images/langchain.png", name: "LangChain" },
		{ src: "/images/antigravity.png", name: "Antigravity" },
		{ src: "/images/docker-plain.svg", name: "Docker" },
	];

	useEffect(() => {
		const interval = setInterval(() => {
			currentTechIndex.value = (currentTechIndex.value + 1) % techIcons.length;
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const botRef = useRef<HTMLDivElement>(null);

	const onPointerDown = (e: PointerEvent) => {
		isDragging.value = true;
		hasMoved.current = false;
		startPos.current = { x: e.clientX, y: e.clientY };
		lastX.current = e.clientX;
		initialBotPos.current = { x: botPos.value.x, y: botPos.value.y };
		e.preventDefault();

		const onMove = (ev: PointerEvent) => {
			const dx = ev.clientX - startPos.current.x;
			const dy = ev.clientY - startPos.current.y;

			const speedX = ev.clientX - lastX.current;
			botTilt.value = Math.max(-15, Math.min(15, speedX * 0.8));
			lastX.current = ev.clientX;

			if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
				hasMoved.current = true;
			}

			botPos.value = {
				x: initialBotPos.current.x + dx,
				y: initialBotPos.current.y + dy,
			};
		};

		const onUp = () => {
			isDragging.value = false;
			botTilt.value = 0;
			document.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerup", onUp);
		};

		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onUp);
	};

	useEffect(() => {
		const updateGlow = () => {
			if (glowRef.current) {
				const intensity = bassIntensity.value;
				const scale = 1 + intensity * 0.05;
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
			class="relative w-full py-10 md:py-20 flex flex-col items-center justify-center"
		>
			{/* Hidden audio element for robot sound */}
			<audio ref={botAudioRef} src="/audio/robot-sound.mp3" preload="auto">
				<track kind="captions" />
			</audio>

			{/* Reactive Background Glow */}
			<div
				ref={glowRef}
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10 transition-transform duration-75 ease-linear will-change-transform"
			/>

			<div class="z-10 w-full max-w-4xl px-4 relative">
				{/* Badge above terminal */}
				<div class="w-full flex justify-center mb-4">
					<TypedMessage
						message={t("home.hero.badge")}
						delay={500}
						loop={true}
						className="relative! left-0! translate-x-0!"
						textClassName="text-xs md:text-sm text-primary font-mono tracking-widest uppercase text-glow"
					/>
				</div>

				{/* Window Frame */}
				<div class="bg-black/60 border border-white/10 rounded-sm shadow-2xl backdrop-blur-md overflow-visible relative group min-h-auto md:min-h-[450px]">
					{/* AI Bot Assistant - Outside Terminal but anchored to it */}
					<div
						ref={botRef}
						class={`absolute -left-2 md:-right-42 lg:-right-2 top-12 md:top-1/6 -translate-y-1/2 w-26 sm:w-32 md:w-48 lg:w-56 select-none mix-blend-screen opacity-90 z-50 will-change-transform ${
							isDragging.value
								? "cursor-grabbing scale-110 z-[100] drop-shadow-[0_40px_50px_rgba(6,182,212,0.4)]"
								: "cursor-grab hover:scale-105 active:scale-95"
						} ${isBotAnimating.value ? "animate-[float_2s_ease-in-out_1]" : ""}`}
						style={{
							left: `${botPos.value.x}px`,
							top: `${botPos.value.y}px`,
							rotate: `${botTilt.value}deg`,
							touchAction: "none",
							transition: isDragging.value
								? "none"
								: "left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), rotate 0.3s ease",
						}}
						onPointerDown={onPointerDown}
						onClick={(e) => {
							if (hasMoved.current) return;
							isBotAnimating.value = true;
							const img = e.currentTarget.querySelector("img");
							if (img) {
								img.src = `/images/bot-ai.gif?t=${Date.now()}`;
							}
							if (botAudioRef.current) {
								botAudioRef.current.currentTime = 0;
								botAudioRef.current.play().catch(() => {});
							}
						}}
						onAnimationEnd={() => {
							isBotAnimating.value = false;
						}}
					>
						<img
							src="/images/bot-ai.gif"
							alt="AI Assistant"
							class="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] md:drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]"
						/>
					</div>

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
							<div class="flex flex-col md:flex-row xl:items-start xl:items-end justify-between xl:gap-8 md:gap-4 xl:mb-8">
								{/* Left: Title & Badge */}
								<div class="space-y-2 flex-1 flex flex-col items-center md:items-start text-center md:text-left">
									{/* Badge removed from here */}
									<h1 class="flex flex-col w-[90%] gap-2 font-black leading-none uppercase items-center md:items-start">
										<div class="flex flex-wrap items-baseline justify-center md:justify-start gap-x-4">
											<span class="text-sm md:text-2xl lg:text-2xl text-muted-foreground tracking-[0.2em]">
												{t("home.hero.software")}
											</span>
											<span
												class="text-4xl md:text-6xl lg:text-6xl text-primary text-glow tracking-tighter"
												style={{
													textShadow: `0 0 ${20 + bassIntensity.value * 40}px rgba(6,182,212,0.8), 0 0 10px rgba(6,182,212,0.3)`,
												}}
											>
												{t("home.hero.software_h")}
											</span>
										</div>
										<div class="flex flex-wrap items-baseline justify-center md:justify-start gap-x-4">
											<span class="text-sm md:text-2xl lg:text-2xl text-muted-foreground tracking-[0.2em]">
												{t("home.hero.engineer")}
											</span>
											<span
												class="text-2xl md:text-3xl lg:text-4xl text-primary text-glow tracking-tighter"
												style={{
													textShadow: `0 0 ${20 + bassIntensity.value * 40}px rgba(6,182,212,0.8), 0 0 10px rgba(6,182,212,0.3)`,
												}}
											>
												{t("home.hero.engineer_h")}
											</span>
										</div>
									</h1>
								</div>

								{/* Right Column: Rotating Tech Card Stack */}
								<div class="flex items-center justify-center lg:ml-auto mt-6 xl:mt-0 mb-4 xl:mb-0">
									<div class="relative w-[140px] h-[140px] flex items-center justify-center">
										{/* Outer HUD Rings */}
										<div class="absolute inset-0 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
										<div class="absolute inset-4 border border-dashed border-primary/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

										{/* Card Stack (Baraja) Container */}
										<div class="relative w-[80px] h-[80px] flex items-center justify-center">
											{/* Next Card (Peeking from right) */}
											<div
												class="absolute top-0 -right-12 w-full h-full rounded-xl bg-white/[0.04] border border-white/10 opacity-40 scale-75 rotate-[12deg] -translate-z-20 transition-all duration-700"
												key={`next-${(currentTechIndex.value + 1) % techIcons.length}`}
											>
												<img
													src={
														techIcons[
															(currentTechIndex.value + 1) % techIcons.length
														].src
													}
													alt="Next Tech"
													class="w-full h-full object-contain p-4 opacity-60"
												/>
											</div>

											{/* Previous Card (Peeking from left) */}
											<div
												class="absolute top-0 -left-12 w-full h-full rounded-xl bg-white/[0.04] border border-white/10 opacity-40 scale-75 rotate-[-12deg] -translate-z-20 transition-all duration-700"
												key={`prev-${(currentTechIndex.value - 1 + techIcons.length) % techIcons.length}`}
											>
												<img
													src={
														techIcons[
															(currentTechIndex.value - 1 + techIcons.length) %
																techIcons.length
														].src
													}
													alt="Prev Tech"
													class="w-full h-full object-contain p-4 opacity-60"
												/>
											</div>

											{/* Main Display Card (Front Center) */}
											<a
												href={`/${lang}/about`}
												class="w-[90px] h-[90px] rounded-xl bg-zinc-900/80 border border-primary/30 p-4 flex items-center justify-center backdrop-blur-md relative overflow-hidden group hover:border-primary/60 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.9)] z-10 cursor-pointer"
												key={`main-${currentTechIndex.value}`}
											>
												<div class="absolute inset-0 bg-scanline opacity-10 pointer-events-none" />
												<div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

												{/* Rotating Icon */}
												<img
													src={techIcons[currentTechIndex.value].src}
													alt="Rotating Tech"
													class="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-in fade-in zoom-in duration-700"
												/>
											</a>
										</div>

										{/* Tech Counter Label */}
										<div class="absolute -bottom-4 right-2 bg-black/80 border border-white/20 px-2 py-0.5 rounded-sm z-20 pointer-events-none">
											<span class="text-[8px] font-mono text-primary font-bold uppercase tracking-tighter">
												{techIcons[currentTechIndex.value].name}
											</span>
										</div>
									</div>
								</div>
							</div>

							<div class="space-y-2 font-mono text-xs md:text-sm text-muted-foreground mt-6 flex flex-col items-center md:items-start text-center md:text-left">
								<p class="flex items-center md:flex-wrap justify-center md:justify-start gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc1")}{" "}
										<span class="text-foreground">
											{t("home.hero.desc1_highlight")}
										</span>{" "}
										{t("home.hero.desc1_end")}
									</span>
								</p>
								<p class="flex items-center md:flex-wrap justify-center md:justify-start gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc2")}{" "}
										<span class="text-foreground">
											{t("home.hero.desc2_highlight")}
										</span>
										{t("home.hero.desc2_end")}
									</span>
								</p>
								<p class="flex items-center md:flex-wrap justify-center md:justify-start gap-2 leading-relaxed">
									<span class="text-primary">&gt;</span>
									<span>
										{t("home.hero.desc3")}{" "}
										<span class="text-foreground">
											{t("home.hero.desc3_highlight")}
										</span>
										{t("home.hero.desc3_end")}
									</span>
								</p>
								<p class="text-[10px] mt-4">{t("home.hero.stack")}</p>
							</div>

							{/* Buttons & Socials */}
							<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mt-8 md:mt-12 relative">
								<div class="flex flex-wrap justify-center md:justify-start gap-4 relative z-20">
									<a
										href={`https://wa.me/51959884398?text=${encodeURIComponent("Hola Yonatan, vi tu portafolio y me gustaría contactarte.")}`}
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Contact via WhatsApp"
										class="px-6 md:px-8 py-3 bg-primary text-primary-foreground font-bold text-[10px] md:text-[11px] tracking-widest uppercase hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 flex items-center justify-center gap-3 group"
									>
										<MessageCircle size={16} className="animate-pulse" />
										{t("home.contact")}
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
								<div class="flex items-center gap-6 justify-center md:justify-start">
									{socials?.github && (
										<a
											href={socials.github}
											target="_blank"
											rel="noopener noreferrer"
											class="text-muted-foreground hover:text-primary transition-all hover:scale-110 p-2 border border-white/5 hover:border-primary/20 bg-white/5 rounded-sm group relative"
											aria-label="GitHub Profile"
										>
											<LucideGithub size={18} />

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
											<LucideLinkedin size={18} />

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
											<LucideTwitter size={18} />

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
											<LucideYoutube size={18} />

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
