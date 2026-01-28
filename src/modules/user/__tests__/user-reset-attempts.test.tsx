// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";

// These tests verify the structure and exports of the ResetAttemptsButton component
// Full integration tests should be done with E2E testing

describe("ResetAttemptsButton Component", () => {
	it("should be exported from the module", async () => {
		const module = await import("../components/user-reset-attempts");
		expect(module.ResetAttemptsButton).toBeDefined();
		expect(typeof module.ResetAttemptsButton).toBe("function");
	});

	it("should have correct component name", async () => {
		const module = await import("../components/user-reset-attempts");
		expect(module.ResetAttemptsButton.name).toBe("ResetAttemptsButton");
	});
});
