import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import type { PortfolioConfigShowSchema } from "@modules/portfolio-config/schemas/portfolio-config.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PortfolioConfigCache {
	private readonly PREFIX = "portfolio_config";

	constructor(private readonly cacheService: CacheService) {}

	/**
	 * Genera la key de caché con aislamiento por tenant
	 */
	private getKey(tenant_id: number): string {
		return `${this.PREFIX}:${tenant_id}:singleton`;
	}

	/**
	 * Obtiene la configuración del caché
	 */
	async get(tenant_id: number): Promise<PortfolioConfigShowSchema | null> {
		const cache = await this.cacheService.get<PortfolioConfigShowSchema>(
			this.getKey(tenant_id),
		);
		return toNull(cache);
	}

	/**
	 * Guarda la configuración en el caché
	 * TTL: 1 hora según rules-endpoints.md
	 */
	async set(
		tenant_id: number,
		config: PortfolioConfigShowSchema,
	): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id),
			config,
			this.cacheService.CACHE_TIMES.HOUR, // 1h TTL
		);
	}

	/**
	 * Invalida la configuración del caché
	 */
	async invalidate(tenant_id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id));
	}
}
