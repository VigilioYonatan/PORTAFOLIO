import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { audioStore } from "@stores/audio.store";
import { isNatureActive, toggleNatureMode } from "@stores/special-mode.store";
import { Loader2Icon, XIcon } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

export default function NatureOverlay() {
	const isActive = isNatureActive.value;
	const hasActivated = useSignal(false);

	// Lazy load logic
	useEffect(() => {
		if (isActive && !hasActivated.value) hasActivated.value = true;
	}, [isActive]);

	if (!hasActivated.value) return null;

	// Pause music when active
	useEffect(() => {
		if (isActive && audioStore.state.isPlaying.value) {
			audioStore.methods.togglePlay();
		}
	}, [isActive]);

	const videos = [
		{ src: "/video/wolf.mp4", label: "OUT THERE" },
		{ src: "/video/bird.mp4", label: "NEMESIS" },
		{ src: "/video/ballena.mp4", label: "SOMEWHERE ELSE" },
	];

	// Track which video is concurrently focused (Mobile tap logic)
	const focusedIndex = useSignal<number | null>(null);

	return (
		<div
			class={cn(
				"fixed inset-0 z-100 bg-black flex flex-col items-center justify-center transition-opacity duration-700",
				isActive
					? "opacity-100 pointer-events-auto"
					: "opacity-0 pointer-events-none",
			)}
		>
			{/* Header */}
			<div class="absolute top-8 left-8 text-white font-black tracking-[0.5em] text-2xl uppercase mix-blend-screen z-50">
				MUZZ_PROTOCOL
			</div>

			{/* Video Grid - Split Screen (3 Columns) */}
			<div class="flex flex-col md:flex-row w-full h-full">
				{videos.map((vid, idx) => (
					<VideoColumn
						key={idx}
						vid={vid}
						isActive={isActive}
						isFocused={focusedIndex.value === idx}
						onToggleFocus={() => {
							// Toggle: If self, turn off. If other, turn on.
							if (focusedIndex.value === idx) {
								focusedIndex.value = null;
							} else {
								focusedIndex.value = idx;
							}
						}}
					/>
				))}
			</div>

			{/* Footer */}
			<div class="absolute bottom-4 left-0 right-0 text-center text-emerald-900/40 font-mono text-[10px] tracking-[0.2em] pointer-events-none uppercase">
				{/* SYSTEM_OVERRIDE // BIOS_BIOME_INTEGRATION */}
				{"SYSTEM_OVERRIDE // BIOS_BIOME_INTEGRATION"}
			</div>

			{/* Close Button - Moved to end for Z-stacking */}
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					toggleNatureMode(false);
				}}
				aria-label="Exit Nature Protocol"
				class="absolute top-8 right-8 z-200 p-4 text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
			>
				<span class="text-[10px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
					EXIT_PROTOCOL
				</span>
				<XIcon size={32} />
			</button>
		</div>
	);
}

function VideoColumn({
	vid,
	isActive,
	isFocused,
	onToggleFocus,
}: {
	vid: { src: string; label: string };
	isActive: boolean;
	isFocused: boolean;
	onToggleFocus: () => void;
}) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const isVideoLoading = useSignal(true);
	const hasError = useSignal(false);
	// Removed internal isFocused signal

	// Sync Playback state with Focus
	useEffect(() => {
		if (!videoRef.current) return;

		if (isFocused) {
			videoRef.current.muted = false;
			videoRef.current.volume = 0.1;
			videoRef.current.play().catch(() => {});
		} else {
			videoRef.current.muted = true;
			videoRef.current.pause();
		}
	}, [isFocused]);

	// Sync loading state with actual video readyState
	useEffect(() => {
		// Safety timeout: If video doesn't report ready in 3s, force show it (it might play anyway)
		const timeout = setTimeout(() => {
			if (isVideoLoading.value) isVideoLoading.value = false;
		}, 3000);

		if (isActive && videoRef.current) {
			// Check if already loaded
			if (videoRef.current.readyState >= 3) {
				isVideoLoading.value = false;
			}
			// We rely on preload="auto" instead of manual load() to avoid race conditions
		}

		return () => clearTimeout(timeout);
	}, [isActive]);

	return (
		<div
			class={cn(
				"group relative flex-1 h-full bg-zinc-950 overflow-hidden transition-all duration-700 ease-in-out border-r border-white/5 last:border-0",
				"hover:flex-[1.5] cursor-pointer",
			)}
		>
			{/* Loading Spinner */}
			{isVideoLoading.value && !hasError.value && (
				<div class="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
					<Loader2Icon size={32} class="text-white/30 animate-spin" />
				</div>
			)}

			{/* Error State */}
			{hasError.value && (
				<div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
					<span class="text-red-500/50 font-black tracking-widest text-xs mb-2">
						SIGNAL_LOST
					</span>
					<span class="text-white/20 font-mono text-[10px] uppercase">
						MISSING_SOURCE_FILE
					</span>
					<span class="text-white/10 font-mono text-[8px] mt-2">{vid.src}</span>
				</div>
			)}

			<video
				ref={videoRef}
				src={vid.src}
				class={cn(
					"w-full h-full object-cover transition-all duration-700",
					// Desktop: Hover effects. Mobile: "isFocused" state removes filters.
					isFocused
						? "grayscale-0 opacity-100"
						: "grayscale group-hover:grayscale-0",
					isVideoLoading.value
						? "opacity-0"
						: isFocused
							? "opacity-100"
							: "opacity-40 group-hover:opacity-100",
					hasError.value && "hidden",
				)}
				muted={!isFocused} // Unmute when focused
				loop
				playsInline
				preload="metadata"
				onClick={(e) => {
					e.preventDefault();
					onToggleFocus();

					// Immediate play feedback handled by effect or parent logic,
					// but we can try to force play here if we just became focused.
					// However, strictly, prop change will trigger re-render.
					// We'll rely on the re-render and effect updates,
					// or simpler: just toggle the state and let Reactivity handle muted prop.

					// Actually, we must manually play/pause here or in an effect because props are reactive but video imperative APIs aren't fully declarative.
					// Let's us a simplified sync in the click specific to the new state intent.

					// const willFocus = !isFocused; // Based on what it WAS. Note: Parent updates this.
					// Wait, we can't predict parent logic 100% (though we know it).
					// Better to use an Effect on `isFocused` prop.
				}}
				onCanPlay={() => {
					isVideoLoading.value = false;
				}}
				onError={() => {
					isVideoLoading.value = false;
					hasError.value = true;
				}}
				onMouseEnter={(e) => {
					if (!hasError.value) {
						// removed isVideoLoading check to allow force-play even if stuck
						e.currentTarget.muted = false;
						e.currentTarget.play().catch(() => {});
					}
				}}
				onMouseLeave={(e) => {
					e.currentTarget.pause();
				}}
			/>

			{/* Label Overlay */}
			<div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 border border-white/30 bg-black/80 px-4 py-2 text-white font-mono text-sm font-bold tracking-[0.3em] uppercase opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm">
				{vid.label}
			</div>

			{/* Hover Hint */}
			{!isVideoLoading.value && !hasError.value && (
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
					<div class="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
						<span class="text-white/50 text-[10px] font-black">+</span>
					</div>
				</div>
			)}
		</div>
	);
}
