import { renderHook } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSSEUser } from "../use-sse";

describe("useSSEUser", () => {
	let mockEventSource: {
		onopen: ((ev: Event) => void) | null;
		onmessage: ((ev: MessageEvent) => void) | null;
		onerror: ((ev: Event) => void) | null;
		close: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockEventSource = {
			onopen: null,
			onmessage: null,
			onerror: null,
			close: vi.fn(),
		};

		class MockEventSource {
			onopen: ((ev: Event) => void) | null = null;
			onmessage: ((ev: MessageEvent) => void) | null = null;
			onerror: ((ev: Event) => void) | null = null;
			close = vi.fn();

			constructor(public url: string) {
				mockEventSource.close = this.close;
			}
		}

		vi.stubGlobal("EventSource", MockEventSource);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should initialize with null data and disconnected state", () => {
		const { result } = renderHook(() =>
			useSSEUser({ url: "/api/sse", userId: 1 }),
		);

		expect(result.current.data.value).toBeNull();
		expect(result.current.error.value).toBeNull();
		expect(result.current.isConnected.value).toBe(false);
	});

	it("should return signals for data, error, and isConnected", () => {
		const { result } = renderHook(() =>
			useSSEUser({ url: "/api/sse", userId: 1 }),
		);

		expect(result.current.data).toBeDefined();
		expect(result.current.error).toBeDefined();
		expect(result.current.isConnected).toBeDefined();
	});

	it("should not create EventSource if userId is falsy", () => {
		const EventSourceSpy = vi.fn();
		vi.stubGlobal("EventSource", EventSourceSpy);

		renderHook(() => useSSEUser({ url: "/api/sse", userId: 0 }));

		expect(EventSourceSpy).not.toHaveBeenCalled();
	});
});
