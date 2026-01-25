import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { AiConfigSchema } from "../schemas/ai-config.schema";

@Injectable()
export class AiCache {
	private getKey(tenant_id: number) {
		return `ai_config:${tenant_id}`;
	}

	constructor(private readonly cacheService: CacheService) {}

	async get(tenant_id: number): Promise<AiConfigSchema | null> {
		const cache = await this.cacheService.get<AiConfigSchema>(
			this.getKey(tenant_id),
		);
		return toNull(cache);
	}

	async set(tenant_id: number, config: AiConfigSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id),
			config,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	async invalidate(tenant_id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id));
	}
}
