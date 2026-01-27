import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { WorkExperienceSchema } from "../schemas/work-experience.schema";
import type { WorkExperienceQueryDto } from "../dtos/work-experience.query.dto";

@Injectable()
export class WorkExperienceCache {
	private readonly PREFIX = "work-experience";

	constructor(private readonly cacheService: CacheService) {}

	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	private getListKey(tenant_id: number, query: WorkExperienceQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
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

	async getList<T>(
		tenant_id: number,
		query: WorkExperienceQueryDto,
	): Promise<T | null> {
		const key = this.getListKey(tenant_id, query);
		const cached = await this.cacheService.get<T>(key);
		return toNull(cached);
	}

	async setList<T>(
		tenant_id: number,
		query: WorkExperienceQueryDto,
		result: T,
	): Promise<void> {
		const key = this.getListKey(tenant_id, query);
		await this.cacheService.set(
			key,
			result,
			this.cacheService.CACHE_TIMES.DAYS_1, // Experiences don't change often
		);
	}

	async invalidate(tenant_id: number, id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id, id));
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:list:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
