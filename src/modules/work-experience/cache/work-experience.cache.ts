import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { WorkExperienceSchema } from "../schemas/work-experience.schema";

@Injectable()
export class WorkExperienceCache {
	private readonly PREFIX = "work-experience";

	constructor(private readonly cacheService: CacheService) {}

	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	private getListKey(tenant_id: number): string {
		return `${this.PREFIX}:list:${tenant_id}`;
	}

	async get(
		tenant_id: number,
		id: number,
	): Promise<WorkExperienceSchema | null> {
		const cache = await this.cacheService.get<WorkExperienceSchema>(
			this.getKey(tenant_id, id),
		);
		return toNull(cache);
	}

	async set(tenant_id: number, data: WorkExperienceSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id, data.id),
			data,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	async invalidate(tenant_id: number, id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id, id));
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		// Invalidate list queries. Since caching strategy for lists usually involves query params,
		// we might need to invalidate by pattern if we cache lists strictly match query params.
		// For now, if we don't strictly cache lists by query (or we invalidate them all on update):
		const pattern = `${this.PREFIX}:list:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}

	// Helper for list caching if needed, though simple invalidation is often safer for CRUD.
	// Assuming invalidation of all lists for tenant on change is acceptable for this scale.
}
