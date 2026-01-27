import { querySchema } from "@infrastructure/schemas/query.schema";
import { z } from "zod";
import { blogPostSchema } from "../schemas/blog-post.schema";

export const blogPostQueryDto = blogPostSchema
	.pick({
		category_id: true,
		is_published: true,
	})
	.partial()
	.extend(querySchema.shape);

export type BlogPostQueryDto = z.infer<typeof blogPostQueryDto>;
