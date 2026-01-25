import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { UsageQuotaQueryDto } from "../dtos/usage-quota.query.dto";
import type { UsageQuotaSchema } from "../schemas/usage-quota.schema";

@Injectable()
export class UsageCache {
	private readonly PREFIX = "usage";

	constructor(private readonly cacheService: CacheService) {}

	private getCurrentKey(tenant_id: number): string {
		return `${this.PREFIX}:${tenant_id}:current`;
	}

	private getHistoryKey(tenant_id: number, query: UsageQuotaQueryDto): string {
		return `${this.PREFIX}:${tenant_id}:history:${JSON.stringify(query)}`;
	}

	async getCurrent(tenant_id: number): Promise<UsageQuotaSchema | null> {
		const result = await this.cacheService.get<UsageQuotaSchema>(
			this.getCurrentKey(tenant_id),
		);
		return toNull(result);
	}

	async setCurrent(tenant_id: number, usage: UsageQuotaSchema): Promise<void> {
		await this.cacheService.set(
			this.getCurrentKey(tenant_id),
			usage,
			this.cacheService.CACHE_TIMES.MINUTE * 5, // 9.1: 5min TTL
		);
	}

	async getHistory(
		tenant_id: number,
		query: UsageQuotaQueryDto,
	): Promise<UsageQuotaSchema[] | null> {
		const result = await this.cacheService.get<UsageQuotaSchema[]>(
			this.getHistoryKey(tenant_id, query),
		);
		return toNull(result);
	}

	async setHistory(
		tenant_id: number,
		query: UsageQuotaQueryDto,
		history: UsageQuotaSchema[],
	): Promise<void> {
		await this.cacheService.set(
			this.getHistoryKey(tenant_id, query),
			history,
			this.cacheService.CACHE_TIMES.HOUR, // 9.2: 1h TTL
		);
	}

	async invalidateCurrent(tenant_id: number): Promise<void> {
		await this.cacheService.del(this.getCurrentKey(tenant_id));
	}

	// History rarely changes (monthly), maybe no strict invalidation needed or just invalidate all history
	async invalidateHistory(tenant_id: number): Promise<void> {
		await this.cacheService.deleteByPattern(
			`${this.PREFIX}:${tenant_id}:history:*`,
		);
	}
}
