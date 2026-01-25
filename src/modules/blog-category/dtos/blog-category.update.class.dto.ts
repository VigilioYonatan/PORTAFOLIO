import { createZodDto } from "nestjs-zod";
import { blogCategoryUpdateSchema } from "./blog-category.update.dto";

export class BlogCategoryUpdateClassDto extends createZodDto(
	blogCategoryUpdateSchema,
) {}
