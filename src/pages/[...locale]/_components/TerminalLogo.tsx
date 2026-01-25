import type { JSX } from "preact/jsx-runtime";

export default function TerminalLogo({ className }: { className?: string }) {
	return (
		<a href="/" className={`font-mono font-bold text-xl group relative ${className}`}>
			<span className="text-primary mr-1">&gt;</span>
			<span className="group-hover:text-primary transition-colors">
				DEV_PORTFOLIO
			</span>
			<span className="animate-blink ml-1 text-primary">_</span>
            
            <span className="absolute inset-0 text-primary opacity-0 group-hover:opacity-100 group-hover:animate-glitch pointer-events-none" aria-hidden="true">
                &gt; DEV_PORTFOLIO_
            </span>
		</a>
	);
}
