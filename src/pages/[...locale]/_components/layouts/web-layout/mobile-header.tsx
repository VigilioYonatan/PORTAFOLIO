import { cn } from "@infrastructure/utils/client/cn";
import { type Lang } from "@src/i18n";
import { Menu, X } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import NavLinks from "../../nav-links";

interface MobileHeaderProps {
	lang: Lang;
}

export default function MobileHeader({ lang }: MobileHeaderProps) {
	const [isOpen, setIsOpen] = useState(false);

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
		<header className="flex md:hidden items-center justify-between p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
			<a href={`/${lang}`} className="flex items-center gap-3 group">
				<img
					src="/images/vigilio.png"
					alt="Vigilio Logo"
					className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
				/>
				<div className="flex flex-col justify-center">
					<span className="text-sm font-black tracking-widest text-white leading-none">
						YONATAN
					</span>
					<span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground leading-none mt-0.5">
						VIGILIO
					</span>
				</div>
			</a>

			<button
				onClick={() => setIsOpen(true)}
				className="p-2 text-primary hover:bg-primary/10 rounded-sm transition-colors"
				aria-label="Open Menu"
				type="button"
			>
				<Menu className="w-6 h-6" />
			</button>

			{/* Full Screen Overlay Menu */}
			<div
				className={cn(
					"fixed inset-0 h-dvh bg-background/95 backdrop-blur-xl z-60 flex flex-col transition-all duration-300 ease-in-out",
					isOpen
						? "opacity-100 translate-x-0"
						: "opacity-0 translate-x-full pointer-events-none",
				)}
			>
				<div className="flex items-center justify-between p-4 border-b border-white/5">
					<span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
						System Navigation
					</span>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-2 text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
						aria-label="Close Menu"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="flex-1 flex flex-col p-8 overflow-y-auto gap-8">
					<div className="flex flex-col gap-4">
						<NavLinks lang={lang} vertical className="gap-6" />
					</div>
				</div>
			</div>
		</header>
	);
}
