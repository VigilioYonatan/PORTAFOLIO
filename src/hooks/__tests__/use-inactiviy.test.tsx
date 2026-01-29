import { act, renderHook } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useInactivity from "../use-inactiviy";

describe("useInactivity", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should call onInactive after timeout", () => {
		const onInactive = vi.fn();
		renderHook(() => useInactivity({ onInactive, timeout: 1000 }));

		expect(onInactive).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(onInactive).toHaveBeenCalledTimes(1);
	});

	it("should use default timeout of 3 minutes", () => {
		const onInactive = vi.fn();
		renderHook(() => useInactivity({ onInactive }));

		act(() => {
			vi.advanceTimersByTime(179999);
		});
		expect(onInactive).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(onInactive).toHaveBeenCalled();
	});

	it("should reset timer on activity", () => {
		const onInactive = vi.fn();
		renderHook(() => useInactivity({ onInactive, timeout: 1000 }));

		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Simulate activity
		act(() => {
			window.dispatchEvent(new Event("mousemove"));
		});

		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Should not be called yet because timer was reset
		expect(onInactive).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(onInactive).toHaveBeenCalled();
	});

	it("should call onActive when returning from inactive state", () => {
		const onInactive = vi.fn();
		const onActive = vi.fn();
		renderHook(() => useInactivity({ onInactive, onActive, timeout: 1000 }));

		// Become inactive
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(onInactive).toHaveBeenCalled();

		// Return to active
		act(() => {
			window.dispatchEvent(new Event("mousemove"));
		});

		expect(onActive).toHaveBeenCalled();
	});

	it("should return current state", () => {
		const onInactive = vi.fn();
		const { result } = renderHook(() =>
			useInactivity({ onInactive, timeout: 1000 }),
		);

		expect(result.current.isInactive).toBe(false);
		expect(result.current.lastActiveTime).toBeDefined();
		expect(typeof result.current.resetActivity).toBe("function");
	});
});
