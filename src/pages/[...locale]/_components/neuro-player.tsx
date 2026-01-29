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
	const showVolumeSlider = useSignal(false);

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
						src="/video/insolation.mp4"
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
				"flex flex-col gap-2 md:gap-3 p-4 md:p-4 border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl font-mono shadow-2xl transition-all relative mt-16",
				(isNatureActive.value || isPlanetActive.value) && "hidden", // Hide in Nature/Planet Mode
				props.className,
			)}
			style={props.style}
		>
			<ReactiveGlow bassIntensity={bassIntensity} midIntensity={midIntensity} />
			{/* Special Buttons - "Floating" above (Desktop Only) */}
			<div class="hidden md:flex absolute -top-16 left-0 right-0 justify-center gap-4">
				<ProtostarButton />
				<NatureButton />
				<PlanetButton />
			</div>

			{/* TOP SECTION: IMAGE & VISUALIZER */}
			<div class="relative w-full h-24 md:h-auto md:aspect-4/3 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group font-sans">
				{/* 1. Dynamic Background Layer */}
				<div class="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
					<div
						key={currentTrack.value?.id}
						class="absolute inset-0 bg-cover bg-center transition-[background-image] duration-1000 ease-in-out"
						style={{
							backgroundImage: `url('${currentTrack.value?.cover || "/images/visualizer-bg.png"}')`,
							animation: "perspectiveShift 16s infinite linear",
						}}
					/>
					{/* Darken for contrast */}
					<div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
					<div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay" />
				</div>

				{/* 2. Content Layout (Overlay) */}
				<div class="absolute inset-0 z-20 flex flex-col justify-end p-3 pb-4">
					{/* Visualizer - Very compact */}
					<div class="w-full flex justify-center mb-0 md:mb-1">
						<div class="w-full h-8 opacity-80">
							<MonstercatVisualizer />
						</div>
					</div>

					{/* Metadata Row: Compact Image + Text */}
					<div class="flex items-center gap-3">
						{/* Small Image (Clone of cover) - Tiny (48px) */}
						<div class="w-12 h-12 shrink-0 border-[1.5px] border-white shadow-[0_0_8px_rgba(0,0,0,0.5)] rounded-none bg-black/50 relative z-30">
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
									<ListMusicIcon size={16} class="text-white/50" />
								</div>
							)}
						</div>

						{/* Text / "Letra" - Small */}
						<div class="flex flex-col justify-center min-w-0 z-30 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
							{/* Artist Name */}
							<h2 class="text-white font-[900] text-sm tracking-wide uppercase leading-none truncate pr-1">
								{currentTrack.value?.artist || "ARTIST"}
							</h2>
							{/* Track Title */}
							<p class="text-white/90 font-bold text-[9px] tracking-widest uppercase mt-0.5 truncate pr-1">
								{currentTrack.value?.title || "TRACK TITLE"}
							</p>
						</div>
					</div>
				</div>

				{/* Top Right Actions (absolute) */}
				<div class="absolute top-2 right-2 flex gap-1 z-20">
					<button
						type="button"
						onClick={() => {
							if (currentTrack.value) toggleFavorite(currentTrack.value.id);
						}}
						class={cn(
							"p-2 rounded-full backdrop-blur-md transition-all hover:scale-110",
							favorites.value.has(currentTrack.value?.id || "")
								? "bg-primary text-black"
								: "bg-black/60 text-white hover:bg-white/20",
						)}
						aria-label={
							favorites.value.has(currentTrack.value?.id || "")
								? "Remove from favorites"
								: "Add to favorites"
						}
					>
						<HeartIcon
							size={14}
							fill={
								favorites.value.has(currentTrack.value?.id || "")
									? "currentColor"
									: "none"
							}
						/>
					</button>
					<button
						type="button"
						onClick={() => {
							isOpenPlaylist.value = true;
						}}
						class="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-white/20 transition-all hover:scale-110"
						aria-label="Open Playlist"
					>
						<ListMusicIcon size={14} />
					</button>
				</div>
			</div>

			{/* BOTTOM SECTION: CONTROLS ONLY (Info moved to Visualizer) */}
			<div class="flex flex-col gap-2 md:gap-3 px-1">
				{/* Info removed from here */}

				{/* Controls */}
				<div class="space-y-1.5 md:space-y-3 bg-white/5 p-2 md:p-3 rounded-xl border border-white/5">
					{/* Progress */}
					<div class="group/prog flex items-center gap-3 cursor-pointer py-1">
						<span class="text-[9px] font-black text-white/40 group-hover/prog:text-primary transition-colors w-6 text-right tabular-nums">
							{formatTime(audioStore.state.currentTime.value)}
						</span>
						<div class="flex-1 h-5 flex items-center relative group/slider">
							{/* Background Bar */}
							<div class="w-full h-1 bg-white/10 rounded-full relative overflow-hidden">
								<div
									class="absolute h-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)] transition-all duration-75 ease-linear"
									style={{
										width: `${(audioStore.state.currentTime.value / audioStore.state.duration.value) * 100}%`,
									}}
								/>
							</div>
							{/* Hover Thumb Indicator */}
							<div
								class="absolute h-3 w-3 bg-white border-2 border-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)] opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none z-30"
								style={{
									left: `${(audioStore.state.currentTime.value / audioStore.state.duration.value) * 100}%`,
									transform: "translateX(-50%)",
								}}
							/>
							<input
								type="range"
								min="0"
								max={audioStore.state.duration.value || 100}
								value={audioStore.state.currentTime.value}
								onInput={(e) => {
									const val = Number(e.currentTarget.value);
									audioStore.methods.seek(val);
								}}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
							/>
						</div>
						<span class="text-[9px] font-black text-white/40 group-hover/prog:text-primary transition-colors w-6 tabular-nums">
							{formatTime(audioStore.state.duration.value)}
						</span>
					</div>

					<div class="flex items-center justify-between gap-2">
						{/* Playback Buttons */}
						<div class="flex items-center justify-center gap-1.5 md:gap-2 flex-1">
							<button
								type="button"
								onClick={prevTrack}
								class="text-white/40 hover:text-white hover:scale-125 transition-all active:scale-90"
								aria-label="Previous Track"
							>
								<StepBackIcon size={18} />
							</button>
							<button
								type="button"
								onClick={togglePlay}
								class="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/40 flex items-center justify-center hover:scale-110 hover:bg-primary hover:text-black transition-all shadow-glow active:scale-95 group/play"
							>
								{isPlaying.value ? (
									<PauseIcon size={24} fill="currentColor" />
								) : (
									<PlayIcon size={24} fill="currentColor" class="ml-1" />
								)}
							</button>
							<button
								type="button"
								onClick={nextTrack}
								class="text-white/40 hover:text-white hover:scale-125 transition-all active:scale-90"
								aria-label="Next Track"
							>
								<StepForwardIcon size={18} />
							</button>
							<button
								type="button"
								onClick={toggleRepeat}
								class={cn(
									"transition-all hover:scale-125 active:scale-90",
									repeatMode.value !== "off"
										? "text-primary text-glow"
										: "text-white/40 hover:text-white",
								)}
								aria-label="Toggle Repeat"
								title={`Repeat: ${repeatMode.value}`}
							>
								{repeatMode.value === "one" ? (
									<Repeat1Icon size={18} />
								) : (
									<RepeatIcon size={18} />
								)}
							</button>
						</div>

						{/* Volume Section - Vertical Pop-up */}
						<div class="relative flex items-center justify-center group/vol">
							<button
								type="button"
								onClick={() => {
									showVolumeSlider.value = !showVolumeSlider.value;
								}}
								onMouseEnter={() => {
									showVolumeSlider.value = true;
								}}
								class={cn(
									"p-1.5 rounded-full transition-all active:scale-90",
									showVolumeSlider.value || volume.value === 0 || isMuted.value
										? "bg-primary/20 text-primary border border-primary/30"
										: "text-white/40 hover:text-primary hover:bg-white/5",
								)}
								aria-label={
									isMuted.value || volume.value === 0 ? "Unmute" : "Mute"
								}
							>
								{isMuted.value || volume.value === 0 ? (
									<VolumeXIcon size={16} />
								) : (
									<Volume2Icon size={16} />
								)}
							</button>

							{/* Vertical Pop-up Slider */}
							<div
								onMouseLeave={() => {
									showVolumeSlider.value = false;
								}}
								class={cn(
									"absolute bottom-full pb-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 origin-bottom flex flex-col items-center",
									showVolumeSlider.value
										? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
										: "opacity-0 scale-75 translate-y-4 pointer-events-none",
								)}
							>
								<div class="bg-zinc-950/90 backdrop-blur-xl border border-primary/20 p-4 rounded-full flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
									<div class="h-32 w-10 flex flex-col items-center justify-center relative">
										{/* Percentage Indicator */}
										<span class="text-[9px] font-black text-primary mb-2 tabular-nums">
											{volume.value}%
										</span>

										{/* Container with range input rotated */}
										<div class="relative h-24 w-1 flex items-center justify-center">
											<div class="absolute h-full w-full bg-white/10 rounded-full overflow-hidden">
												<div
													class="absolute bottom-0 w-full bg-primary shadow-[0_0_10px_var(--primary)] transition-all"
													style={{ height: `${volume.value}%` }}
												/>
											</div>

											{/* Native hidden range input with large hit area */}
											<input
												type="range"
												min="0"
												max="100"
												value={volume.value}
												onInput={(e) => setVolume(Number(e.currentTarget.value))}
												class="absolute h-24 w-10 -rotate-90 cursor-pointer opacity-0 z-10"
												style={{
													// biome-ignore lint/suspicious/noExplicitAny: custom css variable for slider thumb size
													"--thumb-size": "40px",
													width: "96px", // matching 24 * 4
													height: "40px",
												}}
											/>

											{/* Visual Thumb */}
											<div
												class="absolute h-3 w-3 bg-white border-2 border-primary rounded-full shadow-glow pointer-events-none z-20"
												style={{
													bottom: `${volume.value}%`,
													transform: "translateY(50%)",
												}}
											/>
										</div>

										<button
											type="button"
											onClick={() => setVolume(isMuted.value ? 50 : 0)}
											class="mt-4 text-white/40 hover:text-white transition-colors"
										>
											{isMuted.value || volume.value === 0 ? (
												<VolumeXIcon size={12} />
											) : (
												<Volume2Icon size={12} />
											)}
										</button>
									</div>
								</div>
								{/* Arrow indicator */}
								<div class="w-2 h-2 bg-zinc-950 border-r border-b border-primary/20 rotate-45 -mt-1 shadow-glow" />
							</div>
						</div>
					</div>
				</div>
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
}: { bassIntensity: any; midIntensity: any }) {
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
