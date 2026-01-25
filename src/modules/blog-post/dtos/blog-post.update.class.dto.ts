import { createZodDto } from "nestjs-zod";
import { blogPostUpdateDto } from "./blog-post.update.dto";

export class BlogPostUpdateClassDto extends createZodDto(
	blogPostUpdateDto,
) {}
