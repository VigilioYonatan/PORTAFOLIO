import LanguageSwitcher from "@components/extras/language-switcher";
import TechThemeSwitcher from "@components/extras/tech-theme-switcher";
import { cn } from "@infrastructure/utils/client/cn";
import { type Lang, useTranslations } from "@src/i18n";
import { Activity, Cpu, X } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import NeuroPlayer from "../../neuro-player";
import NatureButton from "../../special/nature-button";
import PlanetButton from "../../special/planet-button";
import ProtostarButton from "../../special/protostar-button";
import SystemStats from "../../system-stats";

interface MobileToolsDockProps {
	lang: Lang;
}

export default function MobileToolsDock({ lang }: MobileToolsDockProps) {
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslations(lang);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	return (
		<>
			{/* Floating Action Buttons (FABs) */}
			<div
				className={cn(
					"md:hidden fixed bottom-24 right-6 z-50 transition-all duration-300 flex flex-col gap-4",
					isOpen
						? "translate-y-20 opacity-0 pointer-events-none"
						: "translate-y-0 opacity-100",
				)}
			>
				{/* Tools Button */}
				<button
					onClick={() => {
						setIsOpen(true);
					}}
					type="button"
					className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
					aria-label="Open System Tools"
				>
					<Activity className="w-6 h-6 animate-pulse-slow" />
				</button>
			</div>

			{/* Full Screen Tools Overlay */}
			<div
				className={cn(
					"md:hidden fixed inset-0 h-dvh bg-background/95 backdrop-blur-xl z-60 flex flex-col transition-all duration-300 ease-in-out",
					isOpen
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-full pointer-events-none",
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
					<div className="flex items-center gap-2">
						<Cpu className="w-4 h-4 text-primary" />
						<span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
							System Tools
						</span>
					</div>

					<button
						onClick={() => {
							setIsOpen(false);
						}}
						type="button"
						className="p-2 text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
						aria-label="Close Tools"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 space-y-6 thin-scrollbar pb-20">
					{/* Special Modes */}
					<div className="space-y-2">
						<span className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">
							Reality Modes
						</span>
						<div className="flex gap-4 justify-center p-4 border border-white/5 bg-black/40 rounded-lg">
							<ProtostarButton />
							<NatureButton />
							<PlanetButton />
						</div>
					</div>

					{/* Audio Module */}
					<div className="space-y-2">
						<span className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">
							Audio Module
						</span>
						<NeuroPlayer className="w-full" />
					</div>

					{/* System Stats */}
					<div className="space-y-2">
						<span className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">
							System Status
						</span>
						<div className="p-2 border border-white/5 bg-zinc-950/20 rounded-lg space-y-2">
							<SystemStats lang={lang} />

							{/* Stats Info Cards */}
							<div className="grid grid-cols-3 gap-2 mt-2">
								<div className="p-2 border border-white/5 bg-primary/5 rounded-sm flex flex-col items-center text-center gap-1">
									<div className="p-1 bg-primary/20 rounded-full text-primary">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<title> </title>
											<rect
												x="2"
												y="3"
												width="20"
												height="14"
												rx="2"
												ry="2"
											></rect>
											<line x1="8" y1="21" x2="16" y2="21"></line>
											<line x1="12" y1="17" x2="12" y2="21"></line>
										</svg>
									</div>
									<span className="text-[8px] font-bold tracking-widest text-foreground">
										{t("layout.scalability")}
									</span>
								</div>
								<div className="p-2 border border-white/5 bg-zinc-900/40 rounded-sm flex flex-col items-center text-center gap-1">
									<div className="p-1 bg-indigo-500/20 rounded-full text-indigo-400">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<title> </title>
											<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
										</svg>
									</div>
									<span className="text-[8px] font-bold tracking-widest text-foreground">
										{t("layout.security")}
									</span>
								</div>
								<div className="p-2 border border-white/5 bg-zinc-900/40 rounded-sm flex flex-col items-center text-center gap-1">
									<div className="p-1 bg-emerald-500/20 rounded-full text-emerald-400">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<title> </title>
											<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
										</svg>
									</div>
									<span className="text-[8px] font-bold tracking-widest text-foreground">
										{t("layout.performance")}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Global Settings */}
					<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
						<div className="p-3 border border-white/5 bg-zinc-950/20 rounded-lg flex items-center justify-between">
							<span className="text-[10px] text-muted-foreground uppercase tracking-widest">
								Lang
							</span>
							<LanguageSwitcher />
						</div>
						<div className="p-3 border border-white/5 bg-zinc-950/20 rounded-lg flex items-center justify-between">
							<span className="text-[10px] text-muted-foreground uppercase tracking-widest">
								Theme
							</span>
							<TechThemeSwitcher />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
