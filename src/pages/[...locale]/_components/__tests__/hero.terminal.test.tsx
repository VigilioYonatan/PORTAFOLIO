import { render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import HeroTerminal from "../hero.terminal";

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

describe("HeroTerminal Component", () => {
	it("renders basics and engineer title", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("SOFTWARE")).toBeInTheDocument();
		expect(screen.getByText("ENGINEER_AI")).toBeInTheDocument();
	});

	it("renders CTA buttons with correct text", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("EXECUTE_PROTOCOL")).toBeInTheDocument();
		expect(screen.getByText("SOURCE")).toBeInTheDocument();
	});

	it("renders system subtitles", () => {
		render(<HeroTerminal />);
		// Use more flexible search for text split across spans
		expect(screen.getByText(/Architecting intelligent/i)).toBeInTheDocument();
		expect(screen.getByText(/AI & Automatization/i)).toBeInTheDocument();
		expect(screen.getByText(/solutions\.\.\./i)).toBeInTheDocument();

		expect(screen.getByText(/Crafting immersive/i)).toBeInTheDocument();
		expect(screen.getByText(/Web & Mobile/i)).toBeInTheDocument();
		expect(screen.getByText(/experiences\./i)).toBeInTheDocument();
	});

	it("renders the online badge", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("MULTI_PLATFORM : ONLINE")).toBeInTheDocument();
	});
});
