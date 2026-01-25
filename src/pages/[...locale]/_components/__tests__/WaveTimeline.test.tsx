// @vitest-environment happy-dom
import { render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import WaveTimeline from "../WaveTimeline";
import { workExperienceIndexApi } from "@modules/work-experience/apis/work-experience.index.api";

// Mocking the hooks
vi.mock("@hooks/useMotion", () => ({
	useEntranceAnimation: vi.fn(() => ({ current: null })),
}));

// Mocking the audioStore
vi.mock("@stores/audio.store", async () => {
	const { signal } = await import("@preact/signals");
	return {
		audioStore: {
			state: {
				bassIntensity: signal(0),
				frequencyData: signal(new Uint8Array(64)),
			},
		},
	};
});

// Mocking the API
vi.mock("@modules/work-experience/apis/work-experience.index.api", () => ({
	workExperienceIndexApi: vi.fn(() => ({
		isLoading: false,
		isError: false,
		isSuccess: true,
		data: {
			results: [
				{
					id: 1,
					start_date: "2020-01-01",
					position: "JUNIOR_SYSTEM_DEV",
					company: "ST_INC",
					description: "Initial protocol deployment.",
				},
				{
					id: 2,
					start_date: "2024-01-01",
					position: "SENIOR_ARCHITECT",
					company: "NEURAL_LABS",
					description: "Complex distributed systems.",
				},
			],
		},
	})),
}));

describe("WaveTimeline Component", () => {
	it("renders milestones correctly from API", () => {
		render(<WaveTimeline />);
		expect(screen.getByText("JUNIOR_SYSTEM_DEV")).toBeInTheDocument();
		expect(screen.getByText("SENIOR_ARCHITECT")).toBeInTheDocument();
		expect(screen.getByText("2020")).toBeInTheDocument();
		expect(screen.getByText("2024")).toBeInTheDocument();
	});

	it("renders protocol header", () => {
		render(<WaveTimeline />);
		expect(screen.getByText(/PROTOCOL_HISTORY \/\/ WAVEFORM/)).toBeInTheDocument();
	});

	it("shows empty state when no experiences found", () => {
		vi.mocked(workExperienceIndexApi).mockReturnValue({
			isLoading: false,
			isError: false,
			isSuccess: true,
			data: { results: [] },
		} as any);

		render(<WaveTimeline />);
		expect(screen.getByText("NO_PROTOCOL_HISTORY_FOUND")).toBeInTheDocument();
	});
});
