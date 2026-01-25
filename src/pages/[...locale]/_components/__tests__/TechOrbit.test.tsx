// @vitest-environment happy-dom
import { render } from "@testing-library/preact";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TechOrbit from "../TechOrbit";

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

describe("TechOrbit Component", () => {
    beforeEach(() => {
        // Mock getContext for canvas
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            clearRect: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
        });
    });

	it("renders correctly", () => {
		const { container } = render(<TechOrbit />);
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

    it("applies custom class names", () => {
        const { container } = render(<TechOrbit class="custom-class" />);
        const canvas = container.querySelector("canvas");
        expect(canvas).toHaveClass("custom-class");
    });
});
