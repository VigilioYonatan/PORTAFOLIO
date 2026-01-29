import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { audioStore } from "@stores/audio.store";
import {
	closeOverlayOnly,
	isOverlayOpen,
	isProtostarActive,
} from "@stores/special-mode.store";
import { Loader2Icon, XIcon } from "lucide-preact";
import { useMemo, useEffect, useRef } from "preact/hooks";

export default function ProtostarOverlay() {
	// Lazy Load State - refactored to Signal
	const hasActivated = useSignal(false);

	// Subscribe to signal explicitly for debugging/reliability
	const isActive = isProtostarActive.value; // Keeps video mounted if mode is active
	const isOpen = isOverlayOpen.value; // Controls visibility

	// Monitor activation (mount if mode activates)
	useEffect(() => {
		if (isActive && !hasActivated.value) {
			hasActivated.value = true;
		}
	}, [isActive]);

	// If never activated, don't render (True Lazy Load)
	if (!hasActivated.value) return null;

	const videoRef = useRef<HTMLVideoElement>(null);
	const isLoading = useSignal(true);
	const canClose = useSignal(false);
	const currentTime = useSignal(0);
	const duration = useSignal(0);

	// Manage Playback via Overlay VISIBILITY (isOpen)
	useEffect(() => {
		if (isOpen) {
			// Overlay Open: Pause Music, Play Fullscreen Video
			if (videoRef.current) {
				videoRef.current.muted = false;
				videoRef.current.play();
			}
			if (audioStore.state.isPlaying.value) {
				audioStore.methods.togglePlay();
			}
		} else {
			// Overlay Closed: Pause Fullscreen Video only
			videoRef.current?.pause();
			// Note: We do NOT resume music, because the Mode is still active (Sidebar Video takes over)
		}
	}, [isOpen]);

	// Timer for Close Button (only when Overlay is OPEN)
	useEffect(() => {
		if (isOpen) {
			canClose.value = false;
			const timer = setTimeout(() => {
				canClose.value = true;
			}, 10000);
			return () => clearTimeout(timer);
		} else {
			canClose.value = false;
		}
	}, [isOpen]);

	// Memoize particles to prevent heavy re-calculation and flickering on every time update
	const particles = useMemo(() => {
		return Array.from({ length: 40 }).map((_, i) => ({
			id: i,
			style: {
				top: `${Math.random() * 110}%`,
				left: `${Math.random() * 100}%`,
				width: `${Math.random() * 6 + 2}px`,
				height: `${Math.random() * 6 + 2}px`,
				animation: `float ${Math.random() * 5 + 5}s infinite linear`,
				animationDelay: `-${Math.random() * 5}s`,
				boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255,255,255,0.4)`,
			},
		}));
	}, []);

	const handleVideoLoad = () => {
		isLoading.value = false;
		if (isOpen) videoRef.current?.play();
	};

	const closeOverlay = () => {
		closeOverlayOnly();
		// Mode stays active, just hide overlay
	};

	return (
		<div
			class={cn(
				"fixed inset-0 z-100 bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700",
				isOpen
					? "opacity-100 pointer-events-auto"
					: "opacity-0 pointer-events-none",
			)}
		>
			{/* Fog / Particles Effect - Enhanced (Static Data) */}
			<div class="absolute inset-0 z-10 pointer-events-none overflow-hidden">
				{particles.map((p: any) => (
					<div
						key={p.id}
						class="absolute rounded-full bg-white blur-[2px] opacity-0"
						style={p.style}
					/>
				))}
				{/* Specific Fog Layers (Gradient overlays) */}
				<div class="absolute inset-0 bg-linear-to-t from-green-900/10 via-transparent to-transparent mix-blend-screen" />
				<div class="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-green-500/5 to-transparent blur-xl" />
			</div>

			{/* Video */}
			<video
				ref={videoRef}
				src="/video/insolation.mp4"
				class={cn(
					"w-full h-full object-cover z-0 transition-opacity duration-1000",
					isLoading.value ? "opacity-0" : "opacity-100",
				)}
				onCanPlay={handleVideoLoad}
				onTimeUpdate={(e) => {
					currentTime.value = e.currentTarget.currentTime;
				}}
				onDurationChange={(e) => {
					duration.value = e.currentTarget.duration;
				}}
				onLoadedMetadata={(e) => {
					duration.value = e.currentTarget.duration;
				}}
				playsInline
				loop
				preload="metadata"
			>
				<track kind="captions" src="" label="No Captions" default />
			</video>

			{/* Loading Indicator */}
			{isLoading.value && (
				<div class="absolute inset-0 z-20 flex flex-col items-center justify-center text-green-500">
					<Loader2Icon size={64} class="animate-spin" />
					<p class="mt-4 font-mono text-sm tracking-[0.3em] animate-pulse">
						LOADING PROTOSTAR MODULE...
					</p>
				</div>
			)}

			{/* Close Button (Delayed) */}
			{canClose.value && (
				<button
					type="button"
					onClick={closeOverlay}
					aria-label="Close Protostar Overlay"
					class="absolute top-8 right-8 z-50 p-2 text-white/50 hover:text-white transition-colors duration-300 hover:scale-110 animate-in zoom-in"
				>
					<XIcon size={24} />
				</button>
			)}

			{/* Video Controls - Isolated Component to prevent full overlay re-render */}
			<ProtostarVideoControls
				currentTime={currentTime}
				duration={duration}
				videoRef={videoRef}
			/>
		</div>
	);
}

function ProtostarVideoControls({
	currentTime,
	duration,
	videoRef,
}: {
	currentTime: { value: number };
	duration: { value: number };
	videoRef: { current: HTMLVideoElement | null };
}) {
	const buttons = [
		{ label: "0%", time: 0 },
		{ label: "30%", time: 31, highlightAt: [37, 75.5, 148, 186] },
		{ label: "60%", time: 95, highlightAt: [42.5, 97, 153, 208] },
		{ label: "WARNING", time: 121, highlightAt: [53, 164] },
		{ label: "80%", time: 155, highlightAt: [48, 158] },
		{ label: "90%", time: 230 },
		{ label: "INESTABLE", time: 235 },
	];

	return (
		<div class="absolute bottom-10 left-0 right-0 z-50 flex justify-center gap-4 px-4 w-full max-w-6xl mx-auto pointer-events-auto">
			<div class="grid grid-cols-4 md:grid-cols-7 gap-4 w-full">
				{buttons.map((btn, index) => {
					const nextBtn = buttons[index + 1];
					const startTime = btn.time;
					const endTime = nextBtn ? nextBtn.time : duration.value || 300;
					const current = currentTime.value;

					let progress = 0;
					if (current >= endTime) {
						progress = 100;
					} else if (current > startTime) {
						progress = ((current - startTime) / (endTime - startTime)) * 100;
					}

					const isHighlighted = btn.highlightAt?.some(
						(time) => current >= time && current < time + 1,
					);

					const isRed = ["WARNING", "INESTABLE"].includes(btn.label);
					const fillColor = isRed
						? "rgba(220, 38, 38, 0.5)"
						: "rgba(34, 197, 94, 0.5)";

					return (
						<button
							key={btn.label}
							type="button"
							onClick={() => {
								if (videoRef.current) {
									videoRef.current.currentTime = btn.time;
									videoRef.current.play();
								}
							}}
							style={{
								background: isHighlighted
									? undefined
									: `linear-gradient(90deg, ${fillColor} ${progress}%, transparent ${progress}%)`,
							}}
							class={cn(
								"backdrop-blur-sm border font-mono text-[10px] md:text-sm py-3 px-2 rounded-lg transition-all duration-300 transform uppercase tracking-wider",
								isHighlighted
									? isRed
										? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,1)] scale-110 border-red-400 z-10 ring-2 ring-white/50 text-white"
										: "bg-green-500 shadow-[0_0_30px_rgba(34,197,94,1)] scale-110 border-green-400 z-10 ring-2 ring-white/50 text-white"
									: isRed
										? "bg-red-600/10 border-red-500/50 hover:bg-red-500/30 text-red-100 hover:scale-105 active:scale-95"
										: "bg-green-600/10 border-green-500/50 hover:bg-green-500/30 text-white hover:scale-105 active:scale-95",
							)}
						>
							{btn.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
