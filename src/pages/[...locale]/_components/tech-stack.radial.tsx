import { cn } from "@infrastructure/utils/client";
import { audioStore } from "@stores/audio.store";
import { useEffect, useRef } from "preact/hooks";

interface TechStackRadialProps {
	class?: string;
}

const TECH_GROUPS = [
	{
		name: "FRONTEND",
		items: ["React", "Astro", "Preact", "Tailwind"],
		color: "#06b6d4",
	},
	{
		name: "BACKEND",
		items: ["Node", "NestJS", "Go", "Rust"],
		color: "#3b82f6",
	},
	{
		name: "SYSTEMS",
		items: ["C++", "Linux", "Docker", "K8s"],
		color: "#ef4444",
	},
	{
		name: "DATABASE",
		items: ["Postgres", "Redis", "Mongo", "Elastic"],
		color: "#10b981",
	},
];

export default function TechStackRadial({
	class: className,
}: TechStackRadialProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { frequencyData, bassIntensity, midIntensity } = audioStore.state;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let frame = 0;

		const draw = () => {
			frame++;
			const width = canvas.offsetWidth * window.devicePixelRatio;
			const height = canvas.offsetHeight * window.devicePixelRatio;
			canvas.width = width;
			canvas.height = height;

			ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			const displayWidth = width / window.devicePixelRatio;
			const displayHeight = height / window.devicePixelRatio;
			const displayCenterX = displayWidth / 2;
			const displayCenterY = displayHeight / 2;
			const displayRadius = Math.min(displayWidth, displayHeight) / 3.2;

			ctx.clearRect(0, 0, displayWidth, displayHeight);

			const freq = frequencyData.value;
			const bass = bassIntensity.value;
			const mids = midIntensity.value;

			// Ambient background glow
			const gradient = ctx.createRadialGradient(
				displayCenterX,
				displayCenterY,
				0,
				displayCenterX,
				displayCenterY,
				displayRadius * 2,
			);
			gradient.addColorStop(0, `rgba(6, 182, 212, ${0.03 + bass * 0.05})`);
			gradient.addColorStop(1, "transparent");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, displayWidth, displayHeight);

			// Draw Central Hub Node
			ctx.beginPath();
			ctx.arc(displayCenterX, displayCenterY, 30 + bass * 15, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(6, 182, 212, ${0.5 + mids * 0.5})`;
			ctx.lineWidth = 1;
			ctx.stroke();

			ctx.fillStyle = `rgba(6, 182, 212, ${0.1 + bass * 0.2})`;
			ctx.fill();

			// Draw Core Data Pulse
			if (bass > 0.6) {
				ctx.beginPath();
				ctx.arc(displayCenterX, displayCenterY, 30 + bass * 40, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(6, 182, 212, ${0.1})`;
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			// Draw Orbital Rings
			TECH_GROUPS.forEach((group, gIdx) => {
				const rotationSpeed = (0.005 + gIdx * 0.002) * (1 + mids * 2);
				const rotation = frame * rotationSpeed;
				const groupRadius = displayRadius + gIdx * 25;

				// Group Energy from audio
				const groupFreqIndex = Math.floor(
					(gIdx / TECH_GROUPS.length) * freq.length,
				);
				const groupEnergy = (freq[groupFreqIndex] || 0) / 255;

				// Draw orbital path (Dashed)
				ctx.beginPath();
				ctx.arc(displayCenterX, displayCenterY, groupRadius, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + groupEnergy * 0.05})`;
				ctx.lineWidth = 0.5;
				ctx.setLineDash([2, 10]);
				ctx.stroke();
				ctx.setLineDash([]);

				// Draw Tech Items in group
				group.items.forEach((item, iIdx) => {
					const baseAngle = (iIdx / group.items.length) * Math.PI * 2;
					const itemAngle = baseAngle + rotation;
					const x = displayCenterX + Math.cos(itemAngle) * groupRadius;
					const y = displayCenterY + Math.sin(itemAngle) * groupRadius;

					// Node Decoration (Pulse)
					if (groupEnergy > 0.6) {
						ctx.beginPath();
						ctx.arc(x, y, 8 + groupEnergy * 10, 0, Math.PI * 2);
						ctx.fillStyle = `${group.color}11`;
						ctx.fill();
					}

					// Main Node
					ctx.beginPath();
					ctx.arc(x, y, 3 + groupEnergy * 6, 0, Math.PI * 2);
					ctx.fillStyle = group.color;
					ctx.shadowBlur = groupEnergy * 15;
					ctx.shadowColor = group.color;
					ctx.fill();
					ctx.shadowBlur = 0;

					// Connection Lines to neighbors within group
					const nextAngle =
						((iIdx + 1) / group.items.length) * Math.PI * 2 + rotation;
					const nx = displayCenterX + Math.cos(nextAngle) * groupRadius;
					const ny = displayCenterY + Math.sin(nextAngle) * groupRadius;

					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(nx, ny);
					ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + groupEnergy * 0.1})`;
					ctx.lineWidth = 0.3;
					ctx.stroke();

					// Connection to center (Neural link look)
					ctx.beginPath();
					ctx.moveTo(displayCenterX, displayCenterY);
					ctx.lineTo(x, y);
					ctx.strokeStyle = `rgba(255, 255, 255, ${groupEnergy * 0.03})`;
					ctx.lineWidth = 0.2;
					ctx.stroke();

					// Label (high definition / monospace)
					if (groupEnergy > 0.3 || bass > 0.7) {
						ctx.font = "bold 9px monospace";
						ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
						ctx.textAlign = "center";
						ctx.fillText(item.toUpperCase(), x, y - 10 - groupEnergy * 5);
					}
				});
			});

			requestAnimationFrame(draw);
		};

		const id = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(id);
	}, [frequencyData, bassIntensity, midIntensity]);

	return (
		<div
			class={cn(
				"relative flex items-center justify-center p-8 min-h-[500px] overflow-hidden",
				className,
			)}
		>
			<canvas ref={canvasRef} class="w-full h-full absolute inset-0" />

			{/* Center HUD Element */}
			<div class="relative z-10 flex items-center justify-center pointer-events-none">
				<div class="text-center p-6 border border-primary/20 bg-black/40 backdrop-blur-md rounded-full w-32 h-32 flex flex-col items-center justify-center group">
					<div class="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
					<div class="text-[8px] font-black text-primary/60 uppercase tracking-[0.4em] mb-1">
						core_sys
					</div>
					<div class="text-[12px] font-black tracking-[0.2em] text-white selection:bg-primary selection:text-black">
						KERNEL_v4
					</div>
					<div class="w-12 h-[1px] bg-primary/40 mt-2" />
				</div>
			</div>

			{/* Ambient System Readouts */}
			<div class="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-500 tracking-widest uppercase flex flex-col gap-1 pointer-events-none">
				<span>RADIAL_ORBIT_READY</span>
				<span class="text-primary/40">
					FREQ_SYNC: {frequencyData.value.length} BINS
				</span>
			</div>
		</div>
	);
}
