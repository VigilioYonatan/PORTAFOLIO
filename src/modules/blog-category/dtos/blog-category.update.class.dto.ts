import { createZodDto } from "nestjs-zod";
import { blogCategoryUpdateDto } from "./blog-category.update.dto";

export class BlogCategoryUpdateClassDto extends createZodDto(
	blogCategoryUpdateDto,
) {}
