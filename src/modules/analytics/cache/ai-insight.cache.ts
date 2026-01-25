import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { Injectable } from "@nestjs/common";
import type { AiInsightQueryDto } from "../dtos/ai-insight.query.dto";
import type { AiInsightSchema } from "../schemas/ai-insight.schema";

@Injectable()
export class AiInsightCache {
	private readonly PREFIX = "ai-insight";

	constructor(private readonly cacheService: CacheService) {}

	private getListKey(tenant_id: number, query: AiInsightQueryDto): string {
		return `${this.PREFIX}:${tenant_id}:list:${JSON.stringify(query)}`;
	}

	async getList(
		tenant_id: number,
		query: AiInsightQueryDto,
	): Promise<[AiInsightSchema[], number] | null> {
		const cache = await this.cacheService.get<[AiInsightSchema[], number]>(
			this.getListKey(tenant_id, query),
		);
		return cache || null;
	}

	async setList(
		tenant_id: number,
		query: AiInsightQueryDto,
		result: [AiInsightSchema[], number],
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			result,
			this.cacheService.CACHE_TIMES.HOUR * 12, // 12h TTL
		);
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:${tenant_id}:list:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
