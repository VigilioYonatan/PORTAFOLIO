import { Module } from "@nestjs/common";
import { BlogCategoryCache } from "./cache/blog-category.cache";
import { BlogCategoryController } from "./controllers/blog-category.controller";
import { BlogCategoryRepository } from "./repositories/blog-category.repository";
import { BlogCategoryService } from "./services/blog-category.service";

@Module({
	controllers: [BlogCategoryController],
	providers: [BlogCategoryService, BlogCategoryRepository, BlogCategoryCache],
	exports: [BlogCategoryService],
})
export class BlogCategoryModule {}
