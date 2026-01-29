import { render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import WaveTimeline from "../wave-timeline";

// Mocking the hooks
vi.mock("@hooks/use-motion", () => ({
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
		const mockResults = [
			{
				id: 1,
				start_date: "2020-01-01",
				position: "JUNIOR_SYSTEM_DEV",
				company: "ST_INC",
				description: "Initial protocol deployment.",
			},
		];
		render(<WaveTimeline experiences={mockResults as any} />);
		expect(screen.getByText("JUNIOR_SYSTEM_DEV")).toBeInTheDocument();
		expect(screen.getByText("2020")).toBeInTheDocument();
	});

	it("renders company tags correctly", () => {
		const mockResults = [
			{
				id: 1,
				start_date: "2020-01-01",
				position: "DEV",
				company: "TECH_CORP",
				description: "...",
			},
		];
		render(<WaveTimeline experiences={mockResults as any} />);
		expect(screen.getByText(/TECH_CORP/)).toBeInTheDocument();
	});
});
