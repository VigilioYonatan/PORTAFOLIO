import { cn } from "@infrastructure/utils/client/cn";
import { Palette, X } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
	siDocker,
	siJavascript,
	siNestjs,
	siPhp,
	siPython,
	siReact,
	siTypescript,
} from "simple-icons";
import { SimpleIcon } from "./simple-icon";

// Helper to convert HEX to RGB string "r, g, b"
function hexToRgb(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `${r}, ${g}, ${b}`;
}

// Helper to render SimpleIcon

export default function TechThemeSwitcher({
	className,
}: {
	className?: string;
}) {
	const themes = [
		{ name: "Python", color: "#306998", icon: siPython },
		{ name: "PHP", color: "#777BB4", icon: siPhp },
		{ name: "TypeScript", color: "#3178C6", icon: siTypescript },
		{ name: "JavaScript", color: "#F7DF1E", icon: siJavascript },
		{ name: "Docker", color: "#2496ED", icon: siDocker },
		{ name: "NestJS", color: "#E0234E", icon: siNestjs },
		{ name: "React", color: "#61DAFB", icon: siReact },
		{
			name: "Protostar",
			color: "#22c55e",
			icon: {
				path: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
			} as any,
		},
		{
			name: "Nature",
			color: "#ffffff",
			icon: {
				path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z", // Simple leaf-ish triangle
			} as any,
		},
		{
			name: "Planet",
			color: "#a855f7",
			icon: {
				path: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z", // Simple circle
			} as any,
		},
	];

	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeTheme, setActiveTheme] = useState(themes[0]);

	const changeTheme = (theme: (typeof themes)[0]) => {
		const rgb = hexToRgb(theme.color);
		document.documentElement.style.setProperty("--primary", theme.color);
		document.documentElement.style.setProperty("--primary-rgb", rgb);

		localStorage.setItem("theme-color", theme.color);
		localStorage.setItem("theme-name", theme.name);
		setActiveTheme(theme);
		setIsOpen(false);
	};

	useEffect(() => {
		const savedColor = localStorage.getItem("theme-color");
		const savedName = localStorage.getItem("theme-name");
		if (savedColor) {
			const rgb = hexToRgb(savedColor);
			document.documentElement.style.setProperty("--primary", savedColor);
			document.documentElement.style.setProperty("--primary-rgb", rgb);

			const found =
				themes.find((t) => t.name === savedName) ||
				themes.find((t) => t.color === savedColor);
			if (found) setActiveTheme(found);
		}

		// Click outside listener
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={containerRef} class={cn("relative", className)}>
			<div class="flex items-center gap-2 mb-1 opacity-50">
				<Palette size={12} />
				<span class="text-[9px] font-mono tracking-widest uppercase">
					Tech Theme
				</span>
			</div>

			{/* Trigger Button - Enhanced Design */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				class={cn(
					"w-full flex items-center justify-between gap-2 px-2 py-1.5 bg-zinc-900/50 border border-white/5 rounded-xl hover:border-primary/50 hover:bg-zinc-900 transition-all group shadow-sm",
					isOpen && "border-primary/50 ring-1 ring-primary/20",
				)}
			>
				<div class="flex items-center gap-1.5">
					<div class="p-1.5 bg-white/5 rounded-md text-muted-foreground group-hover:text-primary transition-colors">
						<SimpleIcon icon={activeTheme.icon} size={12} />
					</div>
					<span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
						{activeTheme.name}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<div
						class="w-1.5 h-1.5 rounded-full shadow-[0_0_8px] animate-pulse"
						style={{
							backgroundColor: activeTheme.color,
							boxShadow: `0 0 8px ${activeTheme.color}`,
						}}
					/>
				</div>
			</button>

			{/* Popover Grid - Fixed Positioning & Width */}
			{isOpen && (
				<div class="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[240px] p-4 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95">
					{/* Arrow Pointer */}
					<div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 border-r border-b border-white/10 rotate-45 transform" />

					<div class="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
						<div class="flex flex-col gap-0.5">
							<span class="text-[9px] font-black tracking-[0.2em] text-white uppercase">
								Stack_Protocol
							</span>
							<span class="text-[8px] font-mono text-muted-foreground">
								SELECT_PRIMARY_NODE
							</span>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							class="p-1 hover:bg-white/10 rounded-md text-muted-foreground hover:text-white transition-colors"
						>
							<X size={12} />
						</button>
					</div>

					<div class="grid grid-cols-4 gap-3">
						{themes.map((theme) => {
							const isActive = activeTheme.name === theme.name;
							return (
								<button
									type="button"
									key={theme.name}
									onClick={() => changeTheme(theme)}
									title={theme.name}
									class={cn(
										"aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative group",
										isActive
											? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
											: "bg-black/40 border-white/5 hover:border-primary/40 hover:bg-white/5 hover:scale-105",
									)}
								>
									<SimpleIcon
										icon={theme.icon}
										size={18}
										className={cn(
											"transition-all duration-300",
											isActive
												? "text-primary filter drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]"
												: "text-muted-foreground group-hover:text-primary",
										)}
									/>
									{isActive && (
										<div class="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/20 pointer-events-none" />
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
