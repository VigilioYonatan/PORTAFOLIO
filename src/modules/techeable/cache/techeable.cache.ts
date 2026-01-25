import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { TecheableSchema } from "../schemas/techeable.schema";

@Injectable()
export class TecheableCache {
	private readonly PREFIX = "techeable";

	constructor(private readonly cacheService: CacheService) {}

	async invalidateLists(tenant_id: number): Promise<void> {
		// Broad invalidation since techeables affect projects and blog posts
		// We ideally should invalidate the related entities caches too, but for this module scope:
		await this.cacheService.deleteByPattern(`${this.PREFIX}:${tenant_id}:*`);
	}
}
