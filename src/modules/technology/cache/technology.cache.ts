import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { PaginatorResult, toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import { TechnologyQueryDto } from "../dtos/technology.query.dto";
import { TechnologySchema } from "../schemas/technology.schema";

@Injectable()
export class TechnologyCache {
	private readonly PREFIX = "technology";

	constructor(private readonly cacheService: CacheService) {}

	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	private getListKey(tenant_id: number, query: TechnologyQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
	}

	async get(tenant_id: number, id: number): Promise<TechnologySchema | null> {
		const cache = await this.cacheService.get<TechnologySchema>(
			this.getKey(tenant_id, id),
		);
		return toNull(cache);
	}

	async set(tenant_id: number, technology: TechnologySchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id, technology.id as number),
			technology,
			this.cacheService.CACHE_TIMES.HOUR, // 1 hour TTL from rules
		);
	}

	async getList<T>(
		tenant_id: number,
		query: TechnologyQueryDto,
	): Promise<T | null> {
		const result = await this.cacheService.get(
			this.getListKey(tenant_id, query),
		);
		return result as T | null;
	}

	async setList<T>(
		tenant_id: number,
		query: TechnologyQueryDto,
		data: T,
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			data,
			this.cacheService.CACHE_TIMES.DAYS_1, // 24h as per rules-endpoints.md
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
