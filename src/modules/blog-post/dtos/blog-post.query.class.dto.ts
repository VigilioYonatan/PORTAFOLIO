import { createZodDto } from "nestjs-zod";
import { blogPostQuerySchema } from "./blog-post.query.dto";

export class BlogPostQueryClassDto extends createZodDto(blogPostQuerySchema) {}
