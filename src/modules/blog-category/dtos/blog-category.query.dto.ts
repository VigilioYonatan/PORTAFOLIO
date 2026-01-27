import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { blogCategorySchema } from "../schemas/blog-category.schema";

export const blogCategoryQueryDto = blogCategorySchema
	.pick({
		name: true,
	})
	.partial()
	.extend(querySchema.shape);

export type BlogCategoryQueryDto = z.infer<typeof blogCategoryQueryDto>;
