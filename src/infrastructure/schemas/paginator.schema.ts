import { z } from "../config/zod-i18n.config";

/**
 * Creates a reusable paginated response schema for any item schema.
 * Matches the structure returned by the infrastructure paginator helper.
 */
export function createPaginatorSchema<T extends z.ZodTypeAny>(itemSchema: T) {
	return z.object({
		success: z.literal(true),
		count: z.number().int().nonnegative(),
		next: z.string().nullable(),
		previous: z.string().nullable(),
		results: z.array(itemSchema),
	});
}
