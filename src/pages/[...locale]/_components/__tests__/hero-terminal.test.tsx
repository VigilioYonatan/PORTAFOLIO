import { render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import HeroTerminal from "../hero-terminal";

// Mocking the hooks
vi.mock("@hooks/use-motion", () => ({
	useEntranceAnimation: vi.fn(() => ({ current: null })),
	animate: vi.fn(),
}));

// Mocking the audioStore
vi.mock("@stores/audio.store", async () => {
	const { signal } = await import("@preact/signals");
	return {
		audioStore: {
			state: {
				bassIntensity: signal(0),
				beatDetected: signal(false),
				frequencyData: signal(new Uint8Array(64)),
			},
		},
	};
});

// Mock TerminalLogo to avoid complex SVG rendering issues in simple tests
vi.mock("@components/extras/terminal-logo", () => ({
	default: () => <div data-testid="terminal-logo">LOGO</div>,
}));

// Mock TypedMessage to render its content immediately for tests
vi.mock("../special/typed-message", () => ({
	default: ({ message }: { message: string }) => <span>{message}</span>,
}));

describe("HeroTerminal Component", () => {
	it("renders basics and engineer title", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("home.hero.software")).toBeInTheDocument();
		expect(screen.getByText("home.hero.engineer")).toBeInTheDocument();
	});

	it("renders CTA buttons with correct text", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("home.hero.execute")).toBeInTheDocument();
		// Removed home.hero.source as it was replaced by social links
	});

	it("renders system subtitles", () => {
		render(<HeroTerminal />);
		// Use more flexible search for text split across spans
		expect(screen.getAllByText(/home\.hero\.desc1/i).length).toBeGreaterThan(0);
		expect(
			screen.getAllByText(/home\.hero\.desc1_highlight/i).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByText(/home\.hero\.desc1_end/i).length,
		).toBeGreaterThan(0);

		expect(screen.getAllByText(/home\.hero\.desc2/i).length).toBeGreaterThan(0);
		expect(
			screen.getAllByText(/home\.hero\.desc2_highlight/i).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByText(/home\.hero\.desc2_end/i).length,
		).toBeGreaterThan(0);
	});

	it("renders the online badge", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("home.hero.badge")).toBeInTheDocument();
	});
});
