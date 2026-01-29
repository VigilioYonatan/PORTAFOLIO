import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { blogPostSchema } from "../schemas/blog-post.schema";

export const blogPostQueryDto = blogPostSchema
	.pick({
		category_id: true,
		is_published: true,
		language: true,
	})
	.partial()
	.extend(querySchema.shape);

export type BlogPostQueryDto = z.infer<typeof blogPostQueryDto>;
