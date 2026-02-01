// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NeuroPlayer from "../neuro-player";

// Mocking audioStore
vi.mock("@stores/audio.store", async () => {
	const { signal } = await import("@preact/signals");
	return {
		audioStore: {
			state: {
				isPlaying: signal(false),
				currentTrack: signal({
					id: "1",
					title: "Test Track",
					artist: "Test Artist",
					cover: "",
				}),
				volume: signal(50),
				isMuted: signal(false),
				trackList: signal([
					{ id: "1", title: "Test Track", artist: "Test Artist", cover: "" },
				]),
				favorites: signal(new Set()),
				frequencyData: signal(new Uint8Array(64)),
				bassIntensity: signal(0),
				midIntensity: signal(0),
				currentTime: signal(0),
				duration: signal(100),
				currentTrackIndex: signal(0),
				repeatMode: signal("off"),
			},
			methods: {
				togglePlay: vi.fn(),
				nextTrack: vi.fn(),
				prevTrack: vi.fn(),
				setVolume: vi.fn(),
				toggleFavorite: vi.fn(),
				initStore: vi.fn(),
				seek: vi.fn(),
			},
		},
	};
});

// Mock Modal to avoid complex portal/rendering issues in simple tests
vi.mock("@components/extras/modal", () => ({
	default: ({ children, isOpen }: any) =>
		isOpen ? <div data-testid="modal">{children}</div> : null,
}));

describe("NeuroPlayer Component", () => {
	beforeEach(() => {
		// Mock getContext for visualizer
		HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
			fillRect: vi.fn(),
			clearRect: vi.fn(),
			beginPath: vi.fn(),
			ellipse: vi.fn(),
			stroke: vi.fn(),
			fill: vi.fn(),
			moveTo: vi.fn(),
			lineTo: vi.fn(),
			arc: vi.fn(),
			closePath: vi.fn(),
		});
	});


	const STORAGE_CDN_URL = "https://mock-cdn.com";

	it("renders track info correctly", () => {
		render(<NeuroPlayer STORAGE_CDN_URL={STORAGE_CDN_URL} />);
		expect(screen.getByText("Test Track")).toBeInTheDocument();
		expect(screen.getByText("Test Artist")).toBeInTheDocument();
	});

	it("calls togglePlay when play button is clicked", async () => {
		const { audioStore } = await import("@stores/audio.store");
		render(<NeuroPlayer STORAGE_CDN_URL={STORAGE_CDN_URL} />);
		const playButton = screen.getByLabelText("Play");
		fireEvent.click(playButton);
		expect(audioStore.methods.togglePlay).toHaveBeenCalled();
	});

	it("opens playlist when playlist button is clicked", () => {
		render(<NeuroPlayer STORAGE_CDN_URL={STORAGE_CDN_URL} />);
		const playlistButton = screen.getByLabelText("Open Playlist");
		fireEvent.click(playlistButton);
		expect(screen.getByTestId("modal")).toBeInTheDocument();
		expect(screen.getByText("REACTIVE_ARCHIVE")).toBeInTheDocument();
	});

	it("calls setVolume when volume button is clicked (mute logic)", async () => {
		const { audioStore } = await import("@stores/audio.store");
		render(<NeuroPlayer STORAGE_CDN_URL={STORAGE_CDN_URL} />);
		const muteButton = screen.getByLabelText("Toggle Mute");
		fireEvent.click(muteButton);
		expect(audioStore.methods.setVolume).toHaveBeenCalledWith(0);
	});
});
