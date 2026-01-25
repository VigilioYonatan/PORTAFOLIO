import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";

export const blogCategoryQuerySchema = querySchema.extend({
	// Add specific query params here if needed, e.g. search by name
	name: z.string().optional(),
});

export type BlogCategoryQueryDto = z.infer<typeof blogCategoryQuerySchema>;
