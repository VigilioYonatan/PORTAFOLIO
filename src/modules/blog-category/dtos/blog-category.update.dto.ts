import { z } from "@infrastructure/config/zod-i18n.config";
import { blogCategorySchema } from "../schemas/blog-category.schema";

export const blogCategoryUpdateSchema = blogCategorySchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type BlogCategoryUpdateDto = z.infer<typeof blogCategoryUpdateSchema>;
