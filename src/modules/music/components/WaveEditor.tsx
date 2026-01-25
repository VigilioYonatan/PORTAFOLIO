import { useRef, useEffect } from "preact/hooks";
import { cn } from "@infrastructure/utils/client";

interface WaveEditorProps {
	className?: string;
	isActive?: boolean;
}

export default function WaveEditor({ className, isActive }: WaveEditorProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		let offset = 0;

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = isActive ? "#3b82f6" : "#4b5563"; // primary color or muted

			const width = canvas.width;
			const height = canvas.height;
			const mid = height / 2;

			for (let x = 0; x < width; x++) {
				const y =
					mid +
					Math.sin(x * 0.05 + offset) * (mid * 0.4) +
					Math.sin(x * 0.1 + offset * 2) * (mid * 0.2);
				if (x === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}

			ctx.stroke();

			if (isActive) {
				offset += 0.05;
			}
			animationFrameId = requestAnimationFrame(draw);
		};

		draw();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [isActive]);

	return (
		<div
			class={cn(
				"w-full h-24 bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden relative group",
				className,
			)}
		>
			<canvas
				ref={canvasRef}
				width={400}
				height={100}
				class="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent pointer-events-none" />
			<div class="absolute bottom-2 left-3 flex items-center gap-1.5">
				<div
					class={cn(
						"w-1 h-1 rounded-full animate-pulse",
						isActive ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" : "bg-zinc-600",
					)}
				/>
				<span class="text-[8px] font-black font-mono tracking-widest text-muted-foreground uppercase">
					{isActive ? "SIGNAL_ACTIVE" : "SPECTRUM_IDLE"}
				</span>
			</div>
		</div>
	);
}
