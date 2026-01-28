import { cn } from "@infrastructure/utils/client";
import { audioStore } from "@stores/audio.store";
import { useEffect, useRef } from "preact/hooks";

interface VisualizerProps {
	class?: string;
}

export default function MonstercatVisualizer({
	class: className,
}: VisualizerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { frequencyData, isPlaying } = audioStore.state;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const barCount = 63; // Odd number for perfect center bar
		const bars: number[] = new Array(barCount).fill(0);

		// Optimize: Cache color and update rarely
		let frameCount = 0;
		let cachedPrimaryColor = "#06b6d4";

		const updateColor = () => {
			const style = getComputedStyle(document.documentElement)
				.getPropertyValue("--primary")
				.trim();
			if (style) {
				cachedPrimaryColor =
					style.startsWith("#") || style.startsWith("rgb")
						? style
						: `rgb(${style})`;
			}
		};
		// Initial fetch
		cachedPrimaryColor = "#FFFFFF"; // Force White as requested
		// updateColor(); // Disable dynamic color for now

		const render = () => {
			if (!canvas || !ctx) return;

			frameCount++;
			// Throttle heavy DOM read to every 60 frames (approx 1 sec)
			if (frameCount % 60 === 0) {
				updateColor();
			}

			// Handle potential resizes better
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			if (
				canvas.width !== rect.width * dpr ||
				canvas.height !== rect.height * dpr
			) {
				canvas.width = rect.width * dpr;
				canvas.height = rect.height * dpr;
				ctx.scale(dpr, dpr);
				updateColor(); // Force update on resize
			}

			const width = rect.width;
			const height = rect.height;

			ctx.clearRect(0, 0, width, height);

			const freq = frequencyData.value;
			const gapRatio = 0.2;
			const totalBarWidth = width / barCount;
			const barWidth = totalBarWidth * (1 - gapRatio);
			const gap = totalBarWidth * gapRatio;

			const center = Math.floor(barCount / 2);

			for (let i = 0; i < barCount; i++) {
				// Calculate distance from center (0 to 1)
				const distFromCenter = Math.abs(i - center) / center;

				// Map frequencies: Center = Bass (Low Index), Sides = Treble (High Index)
				// We use a non-linear mapping to focus on the "punchy" low end in the middle
				// freqIndex 0 -> Bass.
				const freqIndex = Math.floor(distFromCenter * (freq.length * 0.6));

				const val = freq[freqIndex] || 0;

				// Standard Linear scaling
				const normalizedVal = val / 255;
				// Boost the center (bass) more, dampen sides slightly for the "small sides" effect
				const boostedVal = normalizedVal ** 1.5 * (1 - distFromCenter * 0.3);
				const targetHeight = boostedVal * height * 0.9;

				// Decay
				if (isPlaying.value) {
					bars[i] = bars[i] + (targetHeight - bars[i]) * 0.45; // Snappy
				} else {
					bars[i] = bars[i] * 0.85;
				}

				const xPos = i * (barWidth + gap);
				const h = Math.max(bars[i], width * 0.005);
				const y = height - h;

				// Design: Sharp bars like reference
				ctx.fillStyle = cachedPrimaryColor;

				ctx.beginPath();
				ctx.rect(xPos, y, barWidth, h);
				ctx.fill();
			}

			requestAnimationFrame(render);
		};

		const id = requestAnimationFrame(render);
		return () => cancelAnimationFrame(id);
	}, [frequencyData, isPlaying]);

	return <canvas ref={canvasRef} class={cn("w-full h-full", className)} />;
}
