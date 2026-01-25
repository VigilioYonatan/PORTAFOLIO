import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { DocumentQueryDto } from "../dtos/document.query.dto";
import type { DocumentSchema } from "../schemas/document.schema";

/**
 * Cache layer for Document module
 * Uses 5-minute TTL for document lists per rules-endpoints.md
 */
@Injectable()
export class DocumentCache {
	private readonly PREFIX = "document";

	constructor(private readonly cacheService: CacheService) {}

	/**
	 * Generates cache key with multi-tenant isolation
	 */
	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	/**
	 * Generates list cache key based on query filters
	 */
	private getListKey(tenant_id: number, query: DocumentQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
	}

	/**
	 * Get a single document from cache
	 */
	async get(tenant_id: number, id: number): Promise<DocumentSchema | null> {
		const cache = await this.cacheService.get<DocumentSchema>(
			this.getKey(tenant_id, id),
		);
		return toNull(cache);
	}

	/**
	 * Set a single document in cache
	 */
	async set(tenant_id: number, document: DocumentSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id, document.id),
			document,
			this.cacheService.CACHE_TIMES.MINUTE * 5,
		);
	}

	/**
	 * Get paginated document list from cache
	 */
	async getList<T>(
		tenant_id: number,
		query: DocumentQueryDto,
	): Promise<T | null> {
		const result = await this.cacheService.get(
			this.getListKey(tenant_id, query),
		);
		return result as T | null;
	}

	/**
	 * Set paginated document list in cache
	 */
	async setList<T>(
		tenant_id: number,
		query: DocumentQueryDto,
		data: T,
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			data,
			this.cacheService.CACHE_TIMES.MINUTE * 5,
		);
	}

	/**
	 * Invalidate a single document from cache
	 */
	async invalidate(tenant_id: number, id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id, id));
	}

	/**
	 * Invalidate all document lists for a tenant
	 */
	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:list:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
