import { z } from "@infrastructure/config/zod-i18n.config";
import type { ArgumentMetadata } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { ZodQueryPipe } from "./zod-query.pipe";

describe("ZodQueryPipe", () => {
	it("should parse number strings as numbers", () => {
		const schema = z.object({
			id: z.number(),
			price: z.number(),
		});
		const pipe = new ZodQueryPipe(schema);

		const input = {
			id: "123",
			price: "99.99",
		};
		// metadata is mocked/ignored in the pipe logic for query check mostly
		const metadata: ArgumentMetadata = { type: "query" };

		const result = pipe.transform(input, metadata);

		expect(result).toEqual({
			id: 123,
			price: 99.99,
		});
		expect(typeof result.id).toBe("number");
	});

	it("should parse boolean strings as booleans bit keep strings as strings", () => {
		const schema = z.object({
			active: z.boolean(),
			name: z.string(),
		});
		const pipe = new ZodQueryPipe(schema);

		const input = {
			active: "true",
			name: "test",
		};
		const metadata: ArgumentMetadata = { type: "query" };

		const result = pipe.transform(input, metadata);

		expect(result).toEqual({
			active: true,
			name: "test",
		});
	});

	it("should handle mixed types correctly", () => {
		const schema = z.object({
			page: z.number(),
			filter: z.string(),
		});
		const pipe = new ZodQueryPipe(schema);

		// JSON.parse("filter") throws, so it stays string
		const input = { page: "1", filter: "some string" };
		const result = pipe.transform(input, { type: "query" });

		expect(result).toEqual({ page: 1, filter: "some string" });
	});

	it("should handle leading zeros (standard JSON behavior)", () => {
		// "0123" is invalid JSON. Should fallback to string.
		const schema = z.object({
			phone: z.string(),
		});
		const pipe = new ZodQueryPipe(schema);

		const input = { phone: "012345678" };
		const result = pipe.transform(input, { type: "query" });

		expect(result).toEqual({ phone: "012345678" });
	});
});
