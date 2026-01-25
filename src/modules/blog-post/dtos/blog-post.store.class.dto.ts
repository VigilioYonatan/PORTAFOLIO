import { createZodDto } from "nestjs-zod";
import { blogPostStoreDto } from "./blog-post.store.dto";

export class BlogPostStoreClassDto extends createZodDto(blogPostStoreDto) {}
