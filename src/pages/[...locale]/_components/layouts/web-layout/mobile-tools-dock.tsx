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
	STORAGE_CDN_URL: string;
}

export default function MobileToolsDock({
	lang,
	STORAGE_CDN_URL,
}: MobileToolsDockProps) {
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslations(lang);

	useEffect(() => {
		const handleClose = () => setIsOpen(false);
		window.addEventListener("close-mobile-menu", handleClose);

		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			window.removeEventListener("close-mobile-menu", handleClose);
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	return (
		<>
			{/* Floating Action Button - Only visible up to 4xl */}
			<div
				className={cn(
					"3xl:hidden fixed bottom-24 right-6 z-50 transition-all duration-300 flex flex-col gap-4",
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

			{/* Slide-out Tools Drawer (Right Side) */}
			<div
				className={cn(
					"5xl:hidden fixed inset-0 z-[70] transition-all duration-300",
					isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
				)}
			>
				{/* Backdrop Overlay */}
				<div
					className="absolute inset-0 bg-black/60 backdrop-blur-sm"
					onClick={() => setIsOpen(false)}
				/>

				{/* Drawer Content */}
				<div
					className={cn(
						"absolute top-0 right-0 h-full w-[399px] max-w-[85%] bg-zinc-950/90 backdrop-blur-2xl border-l border-white/5 flex flex-col transition-transform duration-300 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.5)]",
						isOpen ? "translate-x-0" : "translate-x-full",
					)}
				>
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
						<div className="flex-1 flex flex-col items-center">
							<div className="flex items-center gap-2">
								<Cpu className="w-4 h-4 text-primary" />
								<span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
									Control Panel
								</span>
							</div>
						</div>

						<button
							onClick={() => {
								setIsOpen(false);
							}}
							type="button"
							className="absolute right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
							aria-label="Close Tools"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-20">
						{/* Unified Control Node (Reality + Audio) */}
						<div className="space-y-6">
							<div className="flex items-center gap-2 pl-1">
								<Cpu className="w-3 h-3 text-primary/60" />
								<span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">
									System Terminal
								</span>
							</div>

							<div className="p-4 border border-white/5 bg-white/[0.02] rounded-xl space-y-6">
								<div className="flex gap-4 justify-center">
									<ProtostarButton />
									<NatureButton />
									<PlanetButton />
								</div>

								<div className="border-t border-white/10 pt-6">
									<NeuroPlayer
										STORAGE_CDN_URL={STORAGE_CDN_URL}
										className="w-full bg-transparent border-0 p-0 mt-0 shadow-none"
										hideSpecialButtons
									/>
								</div>
							</div>
						</div>

						{/* System Stats */}
						<div className="space-y-4">
							<span className="text-[10px] text-primary/60 font-black uppercase tracking-widest pl-1">
								Core Status
							</span>
							<div className="p-4 border border-white/5 bg-zinc-950/20 rounded-xl space-y-4">
								<SystemStats lang={lang} />

								{/* Stats Info Cards */}
								<div className="grid grid-cols-3 gap-2 mt-2">
									<div className="p-2 border border-white/5 bg-primary/5 rounded-lg flex flex-col items-center text-center gap-1 group transition-colors hover:bg-primary/10">
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
										<span className="text-[8px] font-black tracking-widest text-foreground uppercase">
											{t("layout.scalability")}
										</span>
									</div>
									<div className="p-2 border border-white/5 bg-zinc-900/40 rounded-lg flex flex-col items-center text-center gap-1 group transition-colors hover:bg-white/5">
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
										<span className="text-[8px] font-black tracking-widest text-foreground uppercase">
											{t("layout.security")}
										</span>
									</div>
									<div className="p-2 border border-white/5 bg-zinc-900/40 rounded-lg flex flex-col items-center text-center gap-1 group transition-colors hover:bg-white/5">
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
										<span className="text-[8px] font-black tracking-widest text-foreground uppercase">
											{t("layout.performance")}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Global Settings */}
						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
							<div className="p-3 border border-white/5 bg-zinc-950/20 rounded-xl flex items-center justify-between group transition-colors hover:bg-white/5">
								<span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
									Lang
								</span>
								<LanguageSwitcher />
							</div>
							<div className="p-3 border border-white/5 bg-zinc-950/20 rounded-xl flex items-center justify-between group transition-colors hover:bg-white/5">
								<span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
									Theme
								</span>
								<TechThemeSwitcher />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
