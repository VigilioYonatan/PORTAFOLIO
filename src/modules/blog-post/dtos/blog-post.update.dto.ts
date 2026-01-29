import { z } from "@infrastructure/config/zod-i18n.config";
import { blogPostSchema } from "../schemas/blog-post.schema";

export const blogPostUpdateDto = blogPostSchema
	.omit({
		id: true,
		parent_id: true,
		language: true,
		created_at: true,
		updated_at: true,
		tenant_id: true,
		author_id: true,
	})
	.partial();

export type BlogPostUpdateDto = z.infer<typeof blogPostUpdateDto>;
