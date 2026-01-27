import { createZodDto } from "nestjs-zod";
import { blogCategoryQueryDto } from "./blog-category.query.dto";

export class BlogCategoryQueryClassDto extends createZodDto(blogCategoryQueryDto) {}
