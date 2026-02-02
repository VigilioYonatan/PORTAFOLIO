import { animate } from "motion";
import { useEffect, useRef, useState } from "preact/hooks";

interface TypedMessageProps {
	message: string;
	delay?: number;
	className?: string;
	textClassName?: string;
	onComplete?: () => void;
	typingSpeed?: number;
	loop?: boolean;
	loopDelay?: number;
}

export default function TypedMessage({
	message,
	delay = 1000,
	className = "",
	textClassName = "",
	onComplete,
	typingSpeed = 50,
	loop = false,
	loopDelay = 3000,
}: TypedMessageProps) {
	const [displayedText, setDisplayedText] = useState("");
	const [isComplete, setIsComplete] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		let charIndex = 0;

		const startTyping = () => {
			if (charIndex < message.length) {
				const char = message[charIndex];
				setDisplayedText(message.slice(0, charIndex + 1));
				charIndex++;

				// Variable typing speed for a more natural keyboard feel
				let speed = typingSpeed + (Math.random() * 80 - 40);

				// Pause slightly longer after punctuation or spaces
				if (/[.,!?;]/.test(char)) speed += 300;
				if (char === " ") speed += 100;

				// Occasional "hesitation" for realism
				if (Math.random() > 0.9) speed += 200;

				timeoutId = setTimeout(startTyping, Math.max(20, speed));
			} else {
				setIsComplete(true);
				onComplete?.();

				if (loop) {
					timeoutId = setTimeout(() => {
						charIndex = 0;
						setDisplayedText("");
						setIsComplete(false);
						startTyping();
					}, loopDelay);
				}
			}
		};

		const initialDelay = setTimeout(startTyping, delay);

		return () => {
			clearTimeout(initialDelay);
			clearTimeout(timeoutId);
		};
	}, [message, delay, typingSpeed, loop, loopDelay, onComplete]);

	useEffect(() => {
		if (containerRef.current && displayedText.length > 0) {
			animate(
				containerRef.current,
				{
					opacity: [0.9, 1],
					y: [2, 0],
					filter: [
						"drop-shadow(0 0 2px rgba(6,182,212,0.2))",
						"drop-shadow(0 0 15px rgba(6,182,212,0.4))",
					],
				},
				{ duration: 0.2 },
			);
		}
	}, [displayedText]);

	return (
		<div ref={containerRef} class={`z-50 pointer-events-none ${className}`}>
			<div class="relative group">
				{/* Premium Glassmorphism Background with Enhanced Glow */}
				<div class="absolute inset-x-0 inset-y-0 bg-primary/20 backdrop-blur-2xl border border-primary/30 rounded-lg -rotate-0.5 group-hover:rotate-0 transition-transform duration-700 shadow-[0_0_30px_rgba(6,182,212,0.1)]" />

				<div class="relative px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl flex items-center gap-4 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-zinc-950/80">
					{/* Status Indicator */}
					<div class="relative flex h-3 w-3">
						<span
							class={`animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 ${isComplete ? "hidden" : ""}`}
						></span>
						<span
							class={`relative inline-flex rounded-full h-3 w-3 bg-primary ${isComplete ? "animate-pulse shadow-[0_0_10px_#06b6d4]" : ""}`}
						></span>
					</div>

					<span
						class={`font-mono font-black tracking-widest text-primary uppercase whitespace-normal break-words leading-relaxed text-glow ${textClassName}`}
					>
						{displayedText}
						<span class="inline-block w-2.5 h-[1.2em] ml-1 bg-primary animate-pulse align-middle shadow-[0_0_15px_rgba(6,182,212,1)]" />
					</span>
				</div>

				{/* Decorative HUD corners - more prominent */}
				<div class="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl-md" />
				<div class="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br-md" />
				<div class="absolute -top-1.5 -right-1.5 w-2 h-2 border-t-2 border-r-2 border-primary/40 rounded-tr-sm" />
				<div class="absolute -bottom-1.5 -left-1.5 w-2 h-2 border-b-2 border-l-2 border-primary/40 rounded-bl-sm" />
			</div>
		</div>
	);
}
