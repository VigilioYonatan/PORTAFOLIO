import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	type PipeTransform,
} from "@nestjs/common";
import { ZodError, type ZodType } from "zod";

@Injectable()
export class ZodQueryPipe<T> implements PipeTransform<unknown, T> {
	constructor(private readonly schema: ZodType<T>) {}

	transform(value: unknown, metadata: ArgumentMetadata): T {
		// Only use parseQuery for query params that are objects
		if (
			metadata.type === "query" &&
			typeof value === "object" &&
			value !== null
		) {
			// Advanced Query Parsing: JSON.parse values to coerce types
			const parsedValue = this.parseQuery(value as Record<string, unknown>);

			try {
				return this.schema.parse(parsedValue);
			} catch (error) {
				this.handleError(error);
			}
		}

		// Fallback for non-query or invalid input
		try {
			return this.schema.parse(value);
		} catch (error) {
			this.handleError(error);
		}

		// Unreachable but TS needs it
		return value as T;
	}

	private parseQuery(query: Record<string, unknown>): Record<string, unknown> {
		const parsed: Record<string, unknown> = {};

		for (const key of Object.keys(query)) {
			const value = query[key];
			if (typeof value === "string") {
				try {
					// Attempt to parse "true", "false", "123", etc.
					// Note: JSON.parse("hello") throws, ensuring strings stay strings
					parsed[key] = JSON.parse(value);
				} catch {
					// If parsing fails, keep the original string value
					parsed[key] = value;
				}
			} else {
				parsed[key] = value;
			}
		}
		return parsed;
	}

	private handleError(error: unknown) {
		if (error instanceof ZodError) {
			throw new BadRequestException({
				message: "Validation failed",
				errors: error.issues,
			});
		}
		throw new BadRequestException("Validation failed");
	}
}
