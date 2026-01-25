import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { type PaginatorResult, toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import type { BlogCategoryEntity } from "../entities/blog-category.entity";

@Injectable()
export class BlogCategoryCache {
	constructor(private readonly cacheService: CacheService) {}

	private getCacheKey(tenantId: number, id: number): string {
		return `tenant:${tenantId}:blog-category:${id}`;
	}

	private getListCacheKeyPattern(tenantId: number): string {
		return `tenant:${tenantId}:blog-category:list:*`;
	}

	async set(tenantId: number, blogCategory: BlogCategoryEntity): Promise<void> {
		const key = this.getCacheKey(tenantId, blogCategory.id);
		await this.cacheService.set(key, blogCategory);
	}

	async get(tenantId: number, id: number): Promise<BlogCategoryEntity | null> {
		const key = this.getCacheKey(tenantId, id);
		const cached = await this.cacheService.get<BlogCategoryEntity>(key);
		return toNull(cached);
	}

	async invalidate(tenantId: number, id: number): Promise<void> {
		const key = this.getCacheKey(tenantId, id);
		await this.cacheService.del(key);
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = this.getListCacheKeyPattern(tenant_id);
		await this.cacheService.deleteByPattern(pattern);
	}

	async getList<T>(
		tenant_id: number,
		query: unknown,
	): Promise<[T[], number] | null> {
		const key = `${this.getListCacheKeyPattern(tenant_id)}:${JSON.stringify(query)}`;
		const cached = await this.cacheService.get<[T[], number]>(key);
		return toNull(cached);
	}

	async setList<T>(
		tenant_id: number,
		query: unknown,
		result: [T[], number],
	): Promise<void> {
		const key = `${this.getListCacheKeyPattern(tenant_id)}:${JSON.stringify(query)}`;
		await this.cacheService.set(key, result);
	}
}
