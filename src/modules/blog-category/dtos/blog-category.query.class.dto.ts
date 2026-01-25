import { createZodDto } from "nestjs-zod";
import { blogCategoryQuerySchema } from "./blog-category.query.dto";

export class BlogCategoryQueryClassDto extends createZodDto(
	blogCategoryQuerySchema,
) {}
