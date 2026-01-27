import { useGlitchHover } from "@hooks/use-motion";
import { cn } from "@infrastructure/utils/client";

interface TerminalLogoProps {
	className?: string;
}

export default function TerminalLogo({ className }: TerminalLogoProps) {
	const { ref, onMouseEnter } = useGlitchHover<HTMLAnchorElement>();

	return (
		<a
			href="/"
			className={cn(
				"group flex items-center gap-2 text-2xl font-black tracking-tighter relative transition-all duration-300",
				"hover:text-primary active:scale-95",
				className,
			)}
			onMouseEnter={onMouseEnter}
			ref={ref}
		>
			<div className="relative flex items-center">
				<span className="text-primary font-mono mr-1 group-hover:animate-pulse">
					&gt;
				</span>
				<div className="relative overflow-hidden">
					<span
						className="glitch-text-heavy inline-block transition-transform duration-300 group-hover:translate-x-1"
						data-text="DEV_TERM"
					>
						DEV_TERM
					</span>
					{/* Mirror glitch layer */}
					<span className="absolute top-0 left-0 w-full h-full text-primary/30 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
						DEV_TERM
					</span>
				</div>
				<span className="animate-blink text-primary ml-1 font-mono">_</span>
			</div>

			{/* Background accent */}
			<div className="absolute -inset-x-2 -inset-y-1 bg-primary/5 rounded opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
		</a>
	);
}
