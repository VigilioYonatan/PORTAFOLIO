import { cn } from "@infrastructure/utils/client/cn";
import { type Lang } from "@src/i18n";
import { Menu, X } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import NavLinks from "../../nav-links";

interface MobileHeaderProps {
	lang: Lang;
	STORAGE_CDN_URL: string;
}

export default function MobileHeader({ lang }: MobileHeaderProps) {
	const [isOpen, setIsOpen] = useState(false);

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
			{/* Floating Hamburger Toggle - Minimal and Persistent */}
			<button
				onClick={() => setIsOpen(true)}
				className={cn(
					"fixed top-4 left-4 z-[60] p-3 bg-black/40 backdrop-blur-md border border-white/10 text-primary rounded-xl shadow-2xl transition-all active:scale-90 3xl:hidden",
					isOpen && "opacity-0 pointer-events-none",
				)}
				aria-label="Open Menu"
				type="button"
			>
				<Menu className="w-6 h-6" />
			</button>

			{/* Slide-out Drawer Menu */}
			<div
				className={cn(
					"fixed inset-0 z-[70] 3xl:hidden transition-all duration-300",
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
						"absolute top-0 left-0 h-full w-64 max-w-[85%] bg-zinc-950/90 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-out shadow-[20px_0_50px_rgba(0,0,0,0.5)]",
						isOpen ? "translate-x-0" : "-translate-x-full",
					)}
				>
					<div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
						<div className="flex-1 flex flex-col items-center">
							<div className="flex items-center gap-3">
								<img
									src="/images/vigilio.png"
									alt="Vigilio Logo"
									className="w-8 h-8 object-contain"
								/>
								<div className="flex flex-col">
									<span className="text-[10px] font-black tracking-widest text-white leading-none">
										SYSTEM
									</span>
									<span className="text-[8px] font-bold tracking-[0.2em] text-primary leading-none mt-1 uppercase">
										Navigation
									</span>
								</div>
							</div>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="absolute right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
							aria-label="Close Menu"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<div className="flex-1 flex flex-col p-6 overflow-y-auto gap-8 custom-scrollbar">
						<div className="flex flex-col gap-4">
							<NavLinks lang={lang} vertical className="gap-6" />
						</div>

						{/* Audio Terminal removed from Left Drawer to avoid duplication with Right Drawer */}
					</div>
				</div>
			</div>
		</>
	);
}
