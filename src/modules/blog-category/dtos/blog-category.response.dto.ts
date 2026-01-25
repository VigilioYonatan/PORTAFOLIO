import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { blogCategorySchema } from "../schemas/blog-category.schema";

// --- Index / List ---
export const blogCategoryIndexResponseDto =
	createPaginatorSchema(blogCategorySchema);
export type BlogCategoryIndexResponseDto = z.infer<
	typeof blogCategoryIndexResponseDto
>;

// --- Show ---
export const blogCategoryShowResponseDto = z.object({
	success: z.literal(true),
	category: blogCategorySchema,
});
export type BlogCategoryShowResponseDto = z.infer<
	typeof blogCategoryShowResponseDto
>;

// --- Store ---
export const blogCategoryStoreResponseDto = z.object({
	success: z.literal(true),
	category: blogCategorySchema,
});
export type BlogCategoryStoreResponseDto = z.infer<
	typeof blogCategoryStoreResponseDto
>;

// --- Update ---
export const blogCategoryUpdateResponseDto = z.object({
	success: z.literal(true),
	category: blogCategorySchema,
});
export type BlogCategoryUpdateResponseDto = z.infer<
	typeof blogCategoryUpdateResponseDto
>;

// --- Destroy ---
export const blogCategoryDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type BlogCategoryDestroyResponseDto = z.infer<
	typeof blogCategoryDestroyResponseDto
>;
