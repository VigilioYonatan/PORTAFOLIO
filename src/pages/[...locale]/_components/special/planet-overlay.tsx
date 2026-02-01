import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { audioStore } from "@stores/audio.store";
import { isPlanetActive, togglePlanetMode } from "@stores/special-mode.store";
import { Loader2Icon, XIcon } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

interface Props {
	STORAGE_CDN_URL: string;
}

export default function PlanetOverlay({ STORAGE_CDN_URL }: Props) {
	const isActive = isPlanetActive.value;
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
		{ src: `${STORAGE_CDN_URL}/video/reaper_car.mp4`, label: "RAVEPUNK" },
		{ src: `${STORAGE_CDN_URL}/video/reaper_ninja.mp4`, label: "HEADHUNTER" },
		{ src: `${STORAGE_CDN_URL}/video/reaper_ovni.mp4`, label: "HEATSEEKER" },
	];

	// Track which video is currently focused
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
			<div class="absolute top-8 left-8 text-purple-500 font-black tracking-[0.5em] text-2xl uppercase mix-blend-screen z-50">
				REAPER_PROTOCOL
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
			<div class="absolute bottom-4 left-0 right-0 text-center text-purple-900/40 font-mono text-[10px] tracking-[0.2em] pointer-events-none uppercase">
				{/* // EXTERNAL_PLANETARY_OVERRIDE // REAPER_OS_v2.0 */}
				{"// EXTERNAL_PLANETARY_OVERRIDE // REAPER_OS_v2.0"}
			</div>

			{/* Close Button - Moved to end for Z-stacking */}
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					togglePlanetMode(false);
				}}
				aria-label="Exit Reaper Protocol"
				class="absolute top-8 right-8 z-200 p-4 text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
			>
				<span class="text-[10px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
					EXIT_REAPER
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
	// Removed internal isFocused

	// Sync Playback state with Focus Prop
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
	useEffect(() => {
		// Safety timeout
		const timeout = setTimeout(() => {
			if (isVideoLoading.value) isVideoLoading.value = false;
		}, 3000);

		if (isActive && videoRef.current) {
			if (videoRef.current.readyState >= 3) {
				isVideoLoading.value = false;
			}
			// No manual load()
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
				<div class="absolute inset-0 z-20 flex items-center justify-center bg-black">
					<Loader2Icon size={32} class="text-purple-500/30 animate-spin" />
				</div>
			)}

			{/* Error State */}
			{hasError.value && (
				<div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 p-4 text-center">
					<span class="text-purple-500/50 font-black tracking-widest text-xs mb-2">
						LINK_FAILURE
					</span>
					<span class="text-white/20 font-mono text-[10px] uppercase">
						UNDEFINED_REAPER_SOURCE
					</span>
				</div>
			)}

			<video
				ref={videoRef}
				src={vid.src}
				class={cn(
					"w-full h-full object-cover transition-all duration-700",
					isFocused
						? "grayscale-0 opacity-100"
						: "grayscale group-hover:grayscale-0",
					isVideoLoading.value
						? "opacity-0"
						: isFocused
							? "opacity-100"
							: "opacity-40 group-hover:opacity-100",
				)}
				muted={!isFocused}
				loop
				playsInline
				preload="auto"
				onClick={(e) => {
					e.preventDefault();
					onToggleFocus();
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
						e.currentTarget.muted = false;
						e.currentTarget.play().catch(() => {});
					}
				}}
				onMouseLeave={(e) => {
					e.currentTarget.pause();
				}}
			>
				<track kind="captions" src="" label="No Captions" default />
			</video>

			{/* Label Overlay */}
			<div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 border border-purple-500/30 bg-black/80 px-4 py-2 text-purple-500 font-mono text-sm font-bold tracking-[0.3em] uppercase opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm">
				{vid.label}
			</div>

			{/* Glitch Overlay Effect on Hover */}
			<div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 bg-purple-500 mix-blend-overlay transition-opacity duration-300"></div>
		</div>
	);
}
