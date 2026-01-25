import { z } from "@infrastructure/config/zod-i18n.config";
import { blogCategorySchema } from "../schemas/blog-category.schema";

export const blogCategoryStoreSchema = blogCategorySchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type BlogCategoryStoreDto = z.infer<typeof blogCategoryStoreSchema>;
