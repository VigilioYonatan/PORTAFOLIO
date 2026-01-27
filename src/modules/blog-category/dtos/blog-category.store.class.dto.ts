import { createZodDto } from "nestjs-zod";
import { blogCategoryStoreDto } from "./blog-category.store.dto";

export class BlogCategoryStoreClassDto extends createZodDto(
	blogCategoryStoreDto,
) {}
