import { createZodDto } from "nestjs-zod";
import { blogCategoryStoreSchema } from "./blog-category.store.dto";

export class BlogCategoryStoreClassDto extends createZodDto(
	blogCategoryStoreSchema,
) {}
