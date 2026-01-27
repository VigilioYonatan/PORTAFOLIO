import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	type PipeTransform,
} from "@nestjs/common";
import { ZodError, type ZodType } from "zod";

@Injectable()
export class ZodPipe<T> implements PipeTransform<unknown, T> {
	constructor(private readonly schema: ZodType<T>) {}

	transform(value: unknown, metadata: ArgumentMetadata): T {
		if (metadata.type === "custom") {
			return value as T;
		}

		try {
			return this.schema.parse(value);
		} catch (error) {
			if (error instanceof ZodError) {
				// Return generic 400 with issues
				const issues = error.issues;
				throw new BadRequestException({
					message: "Validation failed",
					errors: issues,
				});
			}
			throw new BadRequestException("Validation failed");
		}
	}
}
