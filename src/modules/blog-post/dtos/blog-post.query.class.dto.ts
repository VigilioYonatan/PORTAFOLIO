import { createZodDto } from "nestjs-zod";
import { blogPostQueryDto } from "./blog-post.query.dto";

export class BlogPostQueryClassDto extends createZodDto(blogPostQueryDto) {}
