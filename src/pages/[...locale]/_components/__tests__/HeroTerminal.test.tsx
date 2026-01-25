// @vitest-environment happy-dom
import { render, screen, waitFor } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import HeroTerminal from "../HeroTerminal";
import { signal } from "@preact/signals";

// Mocking the hooks
vi.mock("@hooks/useMotion", () => ({
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
    default: () => <div data-testid="terminal-logo">LOGO</div>
}));

describe("HeroTerminal Component", () => {
	it("renders basics and system architect title", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("SYSTEM")).toBeInTheDocument();
		expect(screen.getByText("ARCHITECT")).toBeInTheDocument();
	});

	it("renders CTA buttons with correct text", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("EXECUTE_PROTOCOL")).toBeInTheDocument();
		expect(screen.getByText("SOURCE")).toBeInTheDocument();
	});

	it("renders system subtitles", () => {
		render(<HeroTerminal />);
		expect(screen.getByText(/Initializing high-performance neural architecture/)).toBeInTheDocument();
		expect(screen.getByText(/Senior Full-Stack Engineer/)).toBeInTheDocument();
	});

	it("renders the RAG protocol badge", () => {
		render(<HeroTerminal />);
		expect(screen.getByText("RAG AI PROTOCOL : ACTIVE")).toBeInTheDocument();
	});
});
