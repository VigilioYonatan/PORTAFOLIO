import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { blogPostSchema } from "../schemas/blog-post.schema";

// --- Index / List ---
export const blogPostIndexResponseDto = createPaginatorSchema(blogPostSchema);
export type BlogPostIndexResponseDto = z.infer<typeof blogPostIndexResponseDto>;

// --- Show ---
export const blogPostShowResponseDto = z.object({
	success: z.literal(true),
	post: blogPostSchema,
});
export type BlogPostShowResponseDto = z.infer<typeof blogPostShowResponseDto>;

// --- Store ---
export const blogPostStoreResponseDto = z.object({
	success: z.literal(true),
	post: blogPostSchema,
});
export type BlogPostStoreResponseDto = z.infer<typeof blogPostStoreResponseDto>;

// --- Update ---
export const blogPostUpdateResponseDto = z.object({
	success: z.literal(true),
	post: blogPostSchema,
});
export type BlogPostUpdateResponseDto = z.infer<
	typeof blogPostUpdateResponseDto
>;

// --- Destroy ---
export const blogPostDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type BlogPostDestroyResponseDto = z.infer<
	typeof blogPostDestroyResponseDto
>;
