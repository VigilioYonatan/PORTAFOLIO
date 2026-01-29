import { renderHook } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVisitorId } from "../use-visitor-id";

describe("useVisitorId", () => {
	const STORAGE_KEY = "@portfolio/visitor_id";
	let mockStorage: Record<string, string>;

	beforeEach(() => {
		mockStorage = {};
		vi.stubGlobal("localStorage", {
			getItem: vi.fn((key: string) => mockStorage[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				mockStorage[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete mockStorage[key];
			}),
			clear: vi.fn(() => {
				mockStorage = {};
			}),
		});

		vi.stubGlobal("crypto", {
			randomUUID: vi.fn(() => "test-uuid-12345"),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should return visitor ID after mount", async () => {
		const { result, rerender } = renderHook(() => useVisitorId());
		rerender();
		// In happy-dom, useEffect runs immediately
		expect(result.current).toBe("test-uuid-12345");
	});

	it("should create and store new visitor ID if none exists", async () => {
		const { result, rerender } = renderHook(() => useVisitorId());

		// Wait for effect to run
		rerender();

		expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
		expect(crypto.randomUUID).toHaveBeenCalled();
		expect(localStorage.setItem).toHaveBeenCalledWith(
			STORAGE_KEY,
			"test-uuid-12345",
		);
		expect(result.current).toBe("test-uuid-12345");
	});

	it("should return existing visitor ID from localStorage", async () => {
		mockStorage[STORAGE_KEY] = "existing-visitor-id";

		const { result, rerender } = renderHook(() => useVisitorId());

		rerender();

		expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
		expect(crypto.randomUUID).not.toHaveBeenCalled();
		expect(result.current).toBe("existing-visitor-id");
	});
});
