import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import { type BlogPostQueryDto } from "../dtos/blog-post.query.dto";
import { type BlogPostSchema } from "../schemas/blog-post.schema";

@Injectable()
export class BlogPostCache {
	constructor(private readonly cacheService: CacheService) {}

	async get(tenant_id: number, id: number): Promise<BlogPostSchema | null> {
		return toNull(
			await this.cacheService.get<BlogPostSchema>(
				`tenant:${tenant_id}:blog-posts:${id}`,
			),
		);
	}

	async set(
		tenant_id: number,
		id: number,
		blogPost: BlogPostSchema,
	): Promise<void> {
		return this.cacheService.set(
			`tenant:${tenant_id}:blog-posts:${id}`,
			blogPost,
		);
	}

	async getBySlug(
		tenant_id: number,
		slug: string,
	): Promise<BlogPostSchema | null> {
		return toNull(
			await this.cacheService.get<BlogPostSchema>(
				`tenant:${tenant_id}:blog-posts:slug:${slug}`,
			),
		);
	}

	async setBySlug(
		tenant_id: number,
		slug: string,
		blogPost: BlogPostSchema,
	): Promise<void> {
		return this.cacheService.set(
			`tenant:${tenant_id}:blog-posts:slug:${slug}`,
			blogPost,
		);
	}

	async invalidate(tenant_id: number, id: number, slug: string): Promise<void> {
		await Promise.all([
			this.cacheService.del(`tenant:${tenant_id}:blog-posts:${id}`),
			this.cacheService.del(`tenant:${tenant_id}:blog-posts:slug:${slug}`),
		]);
	}

	async getList<T>(tenant_id: number, query: BlogPostQueryDto) {
		return toNull(
			await this.cacheService.get<T>(
				`tenant:${tenant_id}:blog-posts:list:${JSON.stringify(query)}`,
			),
		);
	}

	async setList<T>(tenant_id: number, query: BlogPostQueryDto, result: T) {
		return this.cacheService.set(
			`tenant:${tenant_id}:blog-posts:list:${JSON.stringify(query)}`,
			result,
			this.cacheService.CACHE_TIMES.MINUTE,
		); // 1 minute cache for lists
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		await this.cacheService.deleteByPattern(
			`tenant:${tenant_id}:blog-posts:list:*`,
		);
	}
}
