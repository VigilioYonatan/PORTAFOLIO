import Modal from "@components/extras/modal";
import { cn } from "@infrastructure/utils/client";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { useSignal } from "@preact/signals";
import { audioStore } from "@stores/audio.store";
import {
	isNatureActive,
	isPlanetActive,
	isProtostarActive,
	toggleProtostarMode,
} from "@stores/special-mode.store";
import {
	HeartIcon,
	ListMusicIcon,
	PauseIcon,
	PlayIcon,
	Repeat1Icon,
	RepeatIcon,
	StepBackIcon,
	StepForwardIcon,
	Volume2Icon,
	VolumeXIcon,
	XIcon,
} from "lucide-preact";
import type { CSSProperties } from "preact";
import { useEffect } from "preact/hooks";
import MonstercatVisualizer from "./monstercat-visualizer";
import NatureButton from "./special/nature-button";
import PlanetButton from "./special/planet-button";
import ProtostarButton from "./special/protostar-button";

interface NeuroPlayerProps {
	className?: string;
	style?: CSSProperties;
	STORAGE_CDN_URL: string;
	hideSpecialButtons?: boolean;
}

export default function NeuroPlayer(props: NeuroPlayerProps) {
	const {
		isPlaying,
		currentTrack,
		volume,
		isMuted,
		trackList,
		favorites,
		bassIntensity,
		midIntensity,
		repeatMode,
	} = audioStore.state;
	const {
		togglePlay,
		nextTrack,
		prevTrack,
		setVolume,
		toggleFavorite,
		toggleRepeat,
	} = audioStore.methods;

	const isOpenPlaylist = useSignal(false);

	const showControls = useSignal(false);

	useEffect(() => {
		// Initialize store (fetch from API) if not already done
		audioStore.methods.initStore();
	}, []);

	// Time helpers
	const formatTime = (seconds: number) => {
		if (!seconds || Number.isNaN(seconds)) return "00:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
	};

	// --- PROTOSTAR MODE: SIDEBAR VIDEO PLAYER ---
	if (isProtostarActive.value) {
		return (
			<div class="flex flex-col gap-3 p-1 rounded-2xl overflow-hidden relative group border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
				{/* Special Protostar Button - "Floating" above (Desktop Only) */}
				<div class="hidden md:flex absolute -top-16 left-0 right-0 justify-center z-50">
					<ProtostarButton />
				</div>

				<div class="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
					<video
						ref={(el) => {
							if (el) el.volume = 0.1;
						}}
						src={`${props.STORAGE_CDN_URL}/video/insolation.mp4`}
						class="w-full h-full object-cover"
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
					>
						<track kind="captions" src="" label="No Captions" default />
					</video>
					{/* Overlay Info */}
					<div class="absolute bottom-2 left-2 z-10">
						<h2 class="text-green-500 font-black text-sm tracking-widest uppercase">
							PROTOSTAR
						</h2>
						<p class="text-white/60 text-[10px] font-mono">SEQ_ACTIVE</p>
					</div>
					{/* Close Mode Button (Small X to fully exit mode) */}
					<button
						type="button"
						onClick={() => {
							toggleProtostarMode(false);
						}}
						class="absolute top-2 right-2 p-1.5 bg-black/50 text-white/50 hover:text-white hover:bg-red-500/80 rounded-full transition-all opacity-0 group-hover:opacity-100"
						title="EXIT PROTOSTAR MODE"
						aria-label="Exit Protostar Mode"
					>
						<XIcon size={12} />
					</button>
				</div>
			</div>
		);
	}

	// --- NORMAL MODE: MUSIC PLAYER ---
	return (
		<div
			class={cn(
				"flex flex-col gap-2 md:gap-3 border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl font-mono shadow-2xl transition-all relative mt-16",
				(isNatureActive.value || isPlanetActive.value) && "hidden", // Hide in Nature/Planet Mode
				props.className,
			)}
			style={props.style}
		>
			<ReactiveGlow bassIntensity={bassIntensity} midIntensity={midIntensity} />
			{/* Special Buttons - "Floating" above (Desktop Only) */}
			{!props.hideSpecialButtons && (
				<div class="hidden md:flex absolute -top-16 left-0 right-0 justify-center gap-4">
					<ProtostarButton />
					<NatureButton />
					<PlanetButton />
				</div>
			)}

			{/* TOP SECTION: MONSTERCAT-STYLE VISUALIZER */}
			<div
				class="relative w-full h-56 md:h-auto md:aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group font-sans cursor-pointer"
				onClick={() => {
					showControls.value = !showControls.value;
				}}
			>
				{/* 1. Dynamic Background Layer (Blurred album art) */}
				<div class="absolute inset-0 w-full h-full overflow-hidden">
					<div
						key={currentTrack.value?.id}
						class="absolute inset-[-20px] bg-cover bg-center transition-[background-image] duration-1000 ease-in-out blur-2xl scale-110"
						style={{
							backgroundImage: `url('${currentTrack.value?.cover || "/images/visualizer-bg.png"}')`,
						}}
					/>
					{/* Dark overlay for contrast */}
					<div class="absolute inset-0 bg-black/60" />
					<div class="absolute inset-0 bg-[url('/grid.svg')] opacity-5 mix-blend-overlay" />
				</div>

				{/* 2. Content Layout - Monstercat Video Style */}
				<div class="absolute inset-0 z-20 flex flex-col">
					{/* Top: Visualizer Bars - Fills remaining space */}
					<div class="flex-1 w-full flex items-end px-3 md:px-5 pt-2 md:pt-4 overflow-hidden">
						<div class="w-full h-full">
							<MonstercatVisualizer />
						</div>
					</div>

					{/* Bottom: Cover Art + Artist/Title + Progress - Fixed height */}
					<div class="shrink-0 px-3 md:px-5 pb-2 md:pb-3 pt-1">
						{/* Artist Row */}
						<div class="flex items-end gap-2 md:gap-3 mb-1">
							{/* Small Album Art */}
							<div class="w-6 h-6 md:w-12 md:h-12 shrink-0 border border-white/20 bg-black/60 rounded-sm overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.6)]">
								{currentTrack.value?.cover ? (
									<img
										src={currentTrack.value.cover}
										class="w-full h-full object-cover"
										alt={currentTrack.value.title}
										title={currentTrack.value.title}
										width={DIMENSION_IMAGE.xs}
										height={DIMENSION_IMAGE.xs}
									/>
								) : (
									<div class="w-full h-full bg-zinc-800 flex items-center justify-center">
										<ListMusicIcon size={14} class="text-white/50" />
									</div>
								)}
							</div>

							{/* Artist & Title */}
							<div class="flex flex-col justify-end min-w-0 flex-1">
								<h2 class="text-white font-black text-[10px] md:text-sm lg:text-base tracking-wider uppercase truncate drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none">
									{currentTrack.value?.artist || "ARTIST"}
								</h2>
								<p class="text-white/70 text-[7px] md:text-[9px] tracking-[0.2em] uppercase truncate font-semibold mt-0.5">
									{currentTrack.value?.title || "TRACK TITLE"}
								</p>
							</div>
						</div>

						{/* Progress Bar */}
						<div class="flex items-center gap-1.5 overflow-hidden">
							<span class="text-[7px] md:text-[8px] font-bold text-white/50 tabular-nums">
								{formatTime(audioStore.state.currentTime.value)}
							</span>
							<div class="flex-1 h-3 flex items-center relative">
								<div class="w-full h-[2px] bg-white/10 rounded-full relative overflow-hidden">
									<div
										class="absolute h-full bg-primary shadow-[0_0_8px_rgba(6,182,212,0.6)]"
										style={{
											width: `${(audioStore.state.currentTime.value / audioStore.state.duration.value) * 100}%`,
										}}
									/>
								</div>
								<input
									type="range"
									min="0"
									max={audioStore.state.duration.value || 100}
									value={audioStore.state.currentTime.value}
									onInput={(e) => {
										e.stopPropagation();
										const val = Number(e.currentTarget.value);
										audioStore.methods.seek(val);
									}}
									onClick={(e) => e.stopPropagation()}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
								/>
							</div>
							<span class="text-[7px] md:text-[8px] font-bold text-white/50 tabular-nums">
								{formatTime(audioStore.state.duration.value)}
							</span>
						</div>
					</div>
				</div>

				{/* 3. INTERACTIVE CONTROLS OVERLAY (Shown on click) */}
				<div
					class={cn(
						"absolute inset-0 z-40 bg-black/80 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center gap-6 p-4",
						showControls.value
							? "opacity-100 pointer-events-auto"
							: "opacity-0 pointer-events-none",
					)}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Close Button */}
					<button
						type="button"
						onClick={() => {
							showControls.value = false;
						}}
						class="absolute top-3 right-3 p-2 text-white/40 hover:text-white transition-colors"
					>
						<XIcon size={16} />
					</button>

					{/* Secondary Controls Row - Now Above */}
					<div class="flex items-center gap-6 mb-2">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								if (currentTrack.value) toggleFavorite(currentTrack.value.id);
							}}
							class={cn(
								"p-1.5 rounded-full transition-all hover:scale-110",
								favorites.value.has(currentTrack.value?.id || "")
									? "text-primary"
									: "text-white/40",
							)}
						>
							<HeartIcon
								size={16}
								fill={
									favorites.value.has(currentTrack.value?.id || "")
										? "currentColor"
										: "none"
								}
							/>
						</button>

						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								toggleRepeat();
							}}
							class={cn(
								"transition-all hover:scale-110",
								repeatMode.value !== "off" ? "text-primary" : "text-white/40",
							)}
						>
							{repeatMode.value === "one" ? (
								<Repeat1Icon size={16} />
							) : (
								<RepeatIcon size={16} />
							)}
						</button>

						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								isOpenPlaylist.value = true;
							}}
							class="text-white/40 hover:text-white hover:scale-110 transition-all"
							aria-label="Open Playlist"
						>
							<ListMusicIcon size={16} />
						</button>
					</div>

					{/* Main Controls Row - Now Below */}
					<div class="flex-1 flex items-center justify-center w-full">
						<div class="flex items-center justify-center gap-8">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									prevTrack();
								}}
								class="text-white/40 hover:text-white hover:scale-125 transition-all p-2"
							>
								<StepBackIcon size={20} />
							</button>

							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									togglePlay();
								}}
								class="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)]"
								aria-label={isPlaying.value ? "Pause" : "Play"}
							>
								{isPlaying.value ? (
									<PauseIcon size={24} />
								) : (
									<PlayIcon size={24} class="ml-1" />
								)}
							</button>

							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									nextTrack();
								}}
								class="text-white/40 hover:text-white hover:scale-125 transition-all p-2"
							>
								<StepForwardIcon size={20} />
							</button>
						</div>
					</div>

					{/* Volume Slider (Horizontal for overlay) */}
					<div class="flex items-center gap-2.5 w-36 mt-1">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setVolume(isMuted.value ? 50 : 0);
							}}
							aria-label="Toggle Mute"
							type="button"
						>
							{isMuted.value || volume.value === 0 ? (
								<VolumeXIcon size={14} />
							) : (
								<Volume2Icon size={14} />
							)}
						</button>
						<div class="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
							<div
								class="absolute h-full bg-primary"
								style={{ width: `${volume.value}%` }}
							/>
							<input
								type="range"
								min="0"
								max="100"
								value={volume.value}
								onInput={(e) => {
									e.stopPropagation();
									setVolume(Number(e.currentTarget.value));
								}}
								onClick={(e) => e.stopPropagation()}
								class="absolute inset-0 opacity-0 cursor-pointer"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Buttons removed as requested */}
			{/* Hidden Metadata - Semantic */}
			<div class="sr-only">
				<span>BITRATE: 320KBPS</span>
				<span>MODE: STEREO_REACTIVE</span>
			</div>

			{/* Hidden Metadata - Semantic */}
			<div class="sr-only">
				<span>BITRATE: 320KBPS</span>
				<span>MODE: STEREO_REACTIVE</span>
			</div>

			{/* Playlist Modal Integration - Kept Simplistic */}
			<Modal
				isOpen={isOpenPlaylist.value}
				onClose={() => {
					isOpenPlaylist.value = false;
				}}
				contentClassName="max-w-md w-full h-[500px] flex flex-col font-mono"
			>
				<div class="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
					<div class="flex items-center gap-3">
						<ListMusicIcon size={18} class="text-primary text-glow" />
						<div class="flex flex-col">
							<h3 class="font-black text-[12px] tracking-[0.3em] uppercase text-white">
								REACTIVE_ARCHIVE
							</h3>
							<span class="text-[8px] text-primary/60 tracking-widest font-bold mt-0.5">
								TOTAL_NODES: {trackList.value.length}
							</span>
						</div>
					</div>
				</div>
				<div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
					{trackList.value.map((track, idx) => {
						const isActive = audioStore.state.currentTrackIndex.value === idx;
						return (
							<button
								key={track.id}
								type="button"
								class={cn(
									"flex items-center gap-4 p-4 rounded-sm cursor-pointer transition-all group relative border border-white/5 w-full text-left",
									isActive
										? "bg-primary/10 border-primary/40 shadow-glow"
										: "hover:bg-white/5 hover:border-white/10",
								)}
								aria-label={`Play ${track.title} by ${track.artist}`}
								onClick={() => {
									audioStore.state.currentTrackIndex.value = idx;
									if (!audioStore.state.isPlaying.value)
										audioStore.methods.togglePlay();
								}}
							>
								<div class="w-12 h-12 rounded-sm bg-black/60 border border-white/10 overflow-hidden shrink-0 relative group-hover:border-primary/40 transition-colors">
									{track.cover && (
										<img
											src={track.cover}
											class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
											alt={track.title}
											title={track.title}
											width={DIMENSION_IMAGE.xs}
											height={DIMENSION_IMAGE.xs}
										/>
									)}
									{isActive && (
										<div class="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
											<div class="flex gap-[2px] items-end h-4">
												<div class="w-[3px] bg-primary animate-[bounce_0.6s_infinite]" />
												<div class="w-[3px] bg-primary animate-[bounce_0.4s_infinite_0.1s]" />
												<div class="w-[3px] bg-primary animate-[bounce_0.8s_infinite_0.2s]" />
											</div>
										</div>
									)}
								</div>
								<div class="flex-1 min-w-0">
									<p
										class={cn(
											"font-black truncate text-[11px] tracking-widest uppercase transition-colors",
											isActive
												? "text-primary text-glow"
												: "text-white group-hover:text-primary/80",
										)}
									>
										{track.title}
									</p>
									<p class="text-[9px] text-muted-foreground truncate uppercase tracking-[0.2em] opacity-60 mt-1">
										{track.artist}
									</p>
								</div>
							</button>
						);
					})}
				</div>
			</Modal>
		</div>
	);
}

function ReactiveGlow({
	bassIntensity,
	midIntensity,
}: {
	bassIntensity: { value: number };
	midIntensity: { value: number };
}) {
	return (
		<div
			class="absolute inset-0 rounded-2xl pointer-events-none -z-10"
			style={{
				boxShadow: `0 0 ${15 + bassIntensity.value * 30}px rgba(var(--primary-rgb),${0.05 + midIntensity.value * 0.1})`,
				transition: "box-shadow 0.1s ease-out",
			}}
		/>
	);
}
