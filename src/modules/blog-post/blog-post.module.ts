import { Module } from "@nestjs/common";
import { BlogPostCache } from "./cache/blog-post.cache";
import { BlogPostController } from "./controllers/blog-post.controller";
import { BlogPostRepository } from "./repositories/blog-post.repository";
import { BlogPostService } from "./services/blog-post.service";

@Module({
	controllers: [BlogPostController],
	providers: [BlogPostService, BlogPostRepository, BlogPostCache],
	exports: [BlogPostService, BlogPostRepository, BlogPostCache],
})
export class BlogPostModule {}
