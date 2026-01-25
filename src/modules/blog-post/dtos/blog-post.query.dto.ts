import { querySchema } from "@infrastructure/schemas/query.schema";
import { z } from "zod";

export const blogPostQuerySchema = querySchema.extend({
	category_id: z.coerce.number().int().positive().optional(),
	is_published: z
		.enum(["true", "false"])
		.transform((val) => val === "true")
		.optional(),
});

export type BlogPostQueryDto = z.infer<typeof blogPostQuerySchema>;
