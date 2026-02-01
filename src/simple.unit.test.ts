import { handlerError } from "@infrastructure/utils/client/handler-error";
import { describe, expect, it } from "vitest";

describe("Simple Unit Test", () => {
	it("should import and run", () => {
		expect(handlerError).toBeDefined();
	});
});
