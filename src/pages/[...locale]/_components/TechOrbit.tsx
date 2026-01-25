import { useEffect, useRef } from "preact/hooks";
import { cn } from "@infrastructure/utils/client";
import { audioStore } from "@stores/audio.store";

interface TechOrbitProps {
	class?: string;
}

interface Particle {
	x: number;
	y: number;
	size: number;
	angle: number;
	speed: number;
	radius: number;
	color: string;
	freqIndex: number;
	type: "dot" | "square" | "dash";
}

export default function TechOrbit({ class: className }: TechOrbitProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { frequencyData, bassIntensity, midIntensity } = audioStore.state;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let particles: Particle[] = [];
		let animationId: number;
		let width = canvas.width;
		let height = canvas.height;

		const colors = ["#06b6d4", "#22d3ee", "#67e8f9", "#ffffff", "#ffffff22"];

		const init = () => {
			width = canvas.width = canvas.offsetWidth;
			height = canvas.height = canvas.offsetHeight;
			particles = [];

			const particleCount = 80;
			for (let i = 0; i < particleCount; i++) {
				const type: Particle["type"] = Math.random() > 0.8 ? "square" : (Math.random() > 0.9 ? "dash" : "dot");
				particles.push({
					x: width / 2,
					y: height / 2,
					size: Math.random() * 2 + 0.5,
					angle: Math.random() * Math.PI * 2,
					speed: (Math.random() * 0.001 + 0.0002) * (Math.random() > 0.5 ? 1 : -1),
					radius: Math.random() * (Math.min(width, height) / 2.2) + 60,
					color: colors[Math.floor(Math.random() * colors.length)],
					freqIndex: Math.floor(Math.random() * 64),
					type,
				});
			}
		};

		const draw = () => {
			// Transparent fade for trails
			ctx.fillStyle = "rgba(9, 9, 11, 0.2)";
			ctx.fillRect(0, 0, width, height);

			const freq = frequencyData.value;
			const bass = bassIntensity.value;
			const mids = midIntensity.value;

			// Draw Orbital Rings (Subtle)
			const ringCount = 3;
			for (let r = 1; r <= ringCount; r++) {
				const rBase = (Math.min(width, height) / 4) * r;
				const rReactive = rBase + bass * 30 + r * 10;
				
				ctx.beginPath();
				ctx.ellipse(width / 2, height / 2, rReactive, rReactive * 0.6, 0, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(6, 182, 212, ${0.05 + bass * 0.1})`;
				ctx.lineWidth = 1;
				ctx.setLineDash([5, 15]);
				ctx.stroke();
				ctx.setLineDash([]);
			}

			particles.forEach((p) => {
				const pFreq = freq[p.freqIndex] || 0;
				const pEnergy = pFreq / 255;

				const currentRadius = p.radius + pEnergy * 60 + bass * 40;
				p.angle += p.speed + pEnergy * 0.03 + bass * 0.02;

				p.x = width / 2 + Math.cos(p.angle) * currentRadius;
				p.y = height / 2 + Math.sin(p.angle) * currentRadius * 0.6;

				ctx.fillStyle = p.color;
				
				if (p.type === "dot") {
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size + pEnergy * 3, 0, Math.PI * 2);
					ctx.fill();
				} else if (p.type === "square") {
					const s = (p.size + pEnergy * 4) * 2;
					ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
				} else {
					const l = 10 + pEnergy * 20;
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(p.x + Math.cos(p.angle) * l, p.y + Math.sin(p.angle) * l);
					ctx.strokeStyle = p.color;
					ctx.lineWidth = 1;
					ctx.stroke();
				}

				// High Energy Bloom
				if (pEnergy > 0.7 && p.type === "dot") {
					ctx.shadowBlur = 15;
					ctx.shadowColor = p.color;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size + pEnergy * 5, 0, Math.PI * 2);
					ctx.stroke();
					ctx.shadowBlur = 0;
				}
			});

			// Central Reactive Core Glow
			const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 100 + bass * 100);
			gradient.addColorStop(0, `rgba(6, 182, 212, ${0.1 + bass * 0.2})`);
			gradient.addColorStop(1, "rgba(6, 182, 212, 0)");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, width, height);

			animationId = requestAnimationFrame(draw);
		};

		init();
		draw();

		const handleResize = () => init();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(animationId);
		};
	}, [frequencyData, bassIntensity, midIntensity]);

	return (
		<canvas
			ref={canvasRef}
			class={cn(
				"absolute inset-0 w-full h-full pointer-events-none -z-5",
				className,
			)}
		/>
	);
}

