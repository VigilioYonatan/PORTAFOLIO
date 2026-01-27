import { printFileWithDimension } from "@infrastructure/utils/hybrid";
import { musicTrackIndexFetch } from "@modules/music/apis/music.index.api";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { computed, signal } from "@preact/signals";

export interface MusicTrack {
	id: string;
	title: string;
	artist: string;
	src: string;
	cover?: string | null;
}

// --- Audio Store State ---
const isPlaying = signal<boolean>(false);
const isMuted = signal<boolean>(false);
const volume = signal<number>(50);
const currentTime = signal<number>(0);
const duration = signal<number>(0);
const trackList = signal<MusicTrack[]>([]);
const currentTrackIndex = signal<number>(0);
const isInitialized = signal<boolean>(false);

// --- Audio Analysis State (Reactive) ---
// We use a fixed size for the frequency data (e.g., 64 bars)
const ANALYSER_FFT_SIZE = 128; // results in 64 bins
const frequencyData = signal<Uint8Array>(new Uint8Array(ANALYSER_FFT_SIZE / 2));
const beatDetected = signal<boolean>(false);
const bassIntensity = signal<number>(0); // 0-1 normalized
const midIntensity = signal<number>(0); // 0-1 normalized

// --- Private Audio Context ---
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioElement: HTMLAudioElement | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let animationFrameId: number | null = null;

// --- Helper: Perlin-ish Noise for Simulation ---
function manualNoise(time: number) {
	return Math.abs(Math.sin(time * 0.005) * Math.cos(time * 0.01) * 255);
}

// --- Methods ---

function initAudio() {
	if (audioElement) return;

	audioElement = new Audio();
	audioElement.crossOrigin = "anonymous";
	audioElement.src = trackList.value[currentTrackIndex.value].src;
	audioElement.volume = volume.value / 100;

	audioElement.addEventListener("ended", nextTrack);
	audioElement.addEventListener("timeupdate", () => {
		currentTime.value = audioElement?.currentTime || 0;
		duration.value = audioElement?.duration || 0;
	});

	// Try to init AudioContext (browser requirement: user interaction)
	try {
		const AudioContextClass =
			window.AudioContext || (window as any).webkitAudioContext;
		audioContext = new AudioContextClass();
		analyser = audioContext.createAnalyser();
		analyser.fftSize = ANALYSER_FFT_SIZE;
		analyser.smoothingTimeConstant = 0.85;

		// Connect nodes
		// NOTE: We only connect if we are actually playing and user gesture allowed it
		// Simpler implementation: Check if context is suspended
	} catch (e) {
		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.warn("Web Audio API not supported or blocked", e);
	}
}

function connectAudioNodes() {
	if (!audioContext || !analyser || !audioElement || sourceNode) return;
	sourceNode = audioContext.createMediaElementSource(audioElement);
	sourceNode.connect(analyser);
	analyser.connect(audioContext.destination);
}

function togglePlay() {
	if (!audioElement) initAudio();
	if (!audioElement) return;

	// Resume context if suspended (browser autoplay policy)
	if (audioContext?.state === "suspended") {
		audioContext.resume();
	}

	connectAudioNodes();

	if (isPlaying.value) {
		audioElement.pause();
		isPlaying.value = false;
		cancelAnimation();
	} else {
		audioElement.play().catch((e) => {
			// biome-ignore lint/suspicious/noConsole: <explanation>
			console.warn("Autoplay blocked, waiting for interaction", e);
		});
		isPlaying.value = true;
		startAnimationLoop();
	}
}

function setVolume(val: number) {
	volume.value = Math.max(0, Math.min(100, val));
	if (audioElement) {
		audioElement.volume = volume.value / 100;
		isMuted.value = volume.value === 0;
	}
}

function seek(time: number) {
	if (!audioElement) initAudio();
	if (audioElement) {
		audioElement.currentTime = time;
		if (audioElement.currentTime !== time) {
			// Some browsers/servers might not support precise seeking or if media not loaded
			// biome-ignore lint/suspicious/noConsole: Expected warning for development
			console.warn("Seek might be clamped by buffered range");
		}
		currentTime.value = time;
	}
}

// Repeat Mode: 'off' | 'all' | 'one'
const repeatMode = signal<"off" | "all" | "one">("off");

function nextTrack() {
	// Repeat One logic
	if (repeatMode.value === "one") {
		if (audioElement) {
			audioElement.currentTime = 0;
			audioElement.play();
		}
		return;
	}

	if (currentTrackIndex.value === trackList.value.length - 1) {
		// End of list behavior
		if (hasMore.value) {
			loadMoreTracks().then(() => {
				if (trackList.value.length > currentTrackIndex.value + 1) {
					currentTrackIndex.value++;
					changeTrack();
				}
			});
			return;
		} else if (repeatMode.value === "all") {
			// Loop back to start
			currentTrackIndex.value = 0;
			changeTrack();
			return;
		}
		// If undefined/off and no more tracks, stop or do nothing (default behavior: stop at end)
		return;
	}

	currentTrackIndex.value =
		(currentTrackIndex.value + 1) % trackList.value.length;
	changeTrack();
}

function prevTrack() {
	// If more than 3 seconds in, restart track
	if (audioElement && audioElement.currentTime > 3) {
		audioElement.currentTime = 0;
		return;
	}

	currentTrackIndex.value =
		(currentTrackIndex.value - 1 + trackList.value.length) %
		trackList.value.length;
	changeTrack();
}

function toggleRepeat() {
	const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
	const nextIndex = (modes.indexOf(repeatMode.value) + 1) % modes.length;
	repeatMode.value = modes[nextIndex];
}

function changeTrack() {
	if (!audioElement) return;
	audioElement.src = trackList.value[currentTrackIndex.value].src;
	if (isPlaying.value) {
		audioElement.play();
	}
}

// --- Animation Loop (Hybrid: Real + Simulated) ---
function startAnimationLoop() {
	if (animationFrameId) cancelAnimationFrame(animationFrameId);

	const update = () => {
		if (!isPlaying.value) return;

		const dataArray = new Uint8Array(ANALYSER_FFT_SIZE / 2);

		if (analyser && audioContext?.state === "running") {
			// Real Data
			analyser.getByteFrequencyData(dataArray);
		} else {
			// Simulated Data (Cyberpunk Idle / Fallback) or just random noise if playing but no context
			const time = Date.now();
			for (let i = 0; i < dataArray.length; i++) {
				// Generate convincing fake spectrum
				const noise = manualNoise(time + i * 100);
				const factor = 1 - i / dataArray.length; // More bass, less treble
				dataArray[i] = Math.min(
					255,
					noise * factor * (Math.random() * 0.5 + 0.5),
				);
			}
		}

		frequencyData.value = dataArray;

		// Calculate Bass Intensity (first 4 bins roughly)
		const bassSum = dataArray.slice(0, 4).reduce((a, b) => a + b, 0);
		const avgBass = bassSum / 4;
		bassIntensity.value = avgBass / 255;

		// Calculate Mids Intensity (bins 5 to 20 roughly)
		const midSum = dataArray.slice(5, 20).reduce((a, b) => a + b, 0);
		const avgMid = midSum / (20 - 5);
		midIntensity.value = avgMid / 255;

		// Simple Beat Detection
		if (avgBass > 200 && !beatDetected.value) {
			beatDetected.value = true;
			setTimeout(() => {
				beatDetected.value = false;
			}, 100);
		}

		animationFrameId = requestAnimationFrame(update);
	};

	update();
}

function cancelAnimation() {
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
	// Reset data to silence or idle visualization?
	// Let's keep the last frame or reset to low noise idle in the future.
	// For now, reset to 0
	frequencyData.value = new Uint8Array(ANALYSER_FFT_SIZE / 2);
	bassIntensity.value = 0;
}

// --- Idle Effect (Optional: run this even when paused for "System ALive" feel) ---
// For now, we only animate when playing to save battery/cpu,
// but components can use simulated data if they want distinct "idle" animations.

function setPlaylist(tracks: MusicTrack[]) {
	// Map to store format if needed, assuming tracks match or we map them
	// For now assuming tracks come in as needed or we map them
	const mapped = tracks.map((t) => ({
		id: String(t.id),
		title: t.title,
		artist: t.artist || "Unknown",
		src: t.src, // Handle potentially different field names from DB schema
		cover: t.cover,
	}));
	trackList.value = mapped;
	currentTrackIndex.value = 0;
	if (audioElement) {
		audioElement.src = trackList.value[0]?.src || "";
	}
}

function addTracks(tracks: MusicTrack[]) {
	const mapped = tracks.map((t) => ({
		id: String(t.id),
		title: t.title,
		artist: t.artist || "Unknown",
		src: t.src,
		cover: t.cover,
	}));
	trackList.value = [...trackList.value, ...mapped];
}

const isLoadingMore = signal<boolean>(false);
const hasMore = signal<boolean>(true);
const page = signal<number>(1);
const favorites = signal<Set<string>>(new Set());

function toggleFavorite(trackId: string) {
	const newFavorites = new Set(favorites.value);
	if (newFavorites.has(trackId)) {
		newFavorites.delete(trackId);
	} else {
		newFavorites.add(trackId);
	}
	favorites.value = newFavorites;
	// In a real app, sync with backend here
}

async function loadMoreTracks() {
	if (isLoadingMore.value || !hasMore.value) return;

	isLoadingMore.value = true;
	try {
		const offset = trackList.value.length;
		// Use the standardized API fetcher
		const data = await musicTrackIndexFetch("/music", null, offset, 10);

		// data is MusicTrackIndexResponseDto
		if (data.success && data.results.length > 0) {
			const mapped = data.results.map((t) => ({
				id: String(t.id),
				title: t.title,
				artist: t.artist || "Unknown",
				src: printFileWithDimension(t.audio_file, null)[0],
				cover: printFileWithDimension(t.cover, DIMENSION_IMAGE.sm)[0],
			}));
			addTracks(mapped);
			page.value++;
			if (data.results.length < 10) {
				hasMore.value = false;
			}
		} else {
			hasMore.value = false;
		}
	} catch (e) {
		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.error("Error loading more tracks:", e);
	} finally {
		isLoadingMore.value = false;
	}
}

async function initStore() {
	if (isInitialized.value) return;
	// Initial fetch
	await loadMoreTracks();
	isInitialized.value = true;
}

export const audioStore = {
	state: {
		isPlaying,
		isMuted,
		volume,
		currentTime,
		duration,
		trackList,
		currentTrackIndex,
		// Reactive Audio Data
		frequencyData,
		beatDetected,
		bassIntensity,
		midIntensity,
		isLoadingMore,
		hasMore,
		repeatMode,
		favorites,
		currentTrack: computed(() => trackList.value[currentTrackIndex.value]),
	},
	methods: {
		togglePlay,
		setVolume,
		nextTrack,
		prevTrack,
		initAudio, // Can be called on first page interaction
		setPlaylist,
		addTracks,
		loadMoreTracks,
		toggleRepeat,
		toggleFavorite,
		initStore,
		seek,
	},
};
