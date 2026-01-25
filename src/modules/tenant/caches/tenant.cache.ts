import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { TenantQueryDto } from "../dtos/tenant.query.dto";
import type { TenantSchema, TenantShowSchema } from "../schemas/tenant.schema";

@Injectable()
export class TenantCache {
	private readonly PREFIX = "tenant";

	constructor(private readonly cacheService: CacheService) {}

	/**
	 * Genera la key de caché por ID
	 */
	private getKey(id: number): string {
		return `${this.PREFIX}:${id}`;
	}

	/**
	 * Genera la key de caché por Host
	 */
	private getKeyByHost(host: string): string {
		return `${this.PREFIX}:host:${host}`;
	}

	/**
	 * Genera la key de caché para listas paginadas
	 */
	private getListKey(query: TenantQueryDto): string {
		return `${this.PREFIX}:list:${JSON.stringify(query)}`;
	}

	/**
	 * Obtiene un tenant del caché por ID
	 */
	async get(id: number): Promise<TenantShowSchema | null> {
		const cache = await this.cacheService.get<TenantShowSchema>(
			this.getKey(id),
		);
		return toNull(cache);
	}

	/**
	 * Obtiene un tenant del caché por Host
	 */
	async getByHost(host: string): Promise<TenantShowSchema | null> {
		const cache = await this.cacheService.get<TenantShowSchema>(
			this.getKeyByHost(host),
		);
		return toNull(cache);
	}

	/**
	 * Guarda un tenant en el caché por ID
	 */
	async set(tenant: TenantShowSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant.id),
			tenant,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	/**
	 * Guarda un tenant en el caché por Host
	 */
	async setByHost(host: string, tenant: TenantShowSchema): Promise<void> {
		await this.cacheService.set(
			this.getKeyByHost(host),
			tenant,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	/**
	 * Invalida un tenant específico del caché
	 */
	async invalidate(id: number): Promise<void> {
		await this.cacheService.del(this.getKey(id));
	}

	/**
	 * Obtiene lista paginada del caché
	 */
	async getList(
		query: TenantQueryDto,
	): Promise<[TenantSchema[], number] | null> {
		const cache = await this.cacheService.get<[TenantSchema[], number]>(
			this.getListKey(query),
		);
		return toNull(cache);
	}

	/**
	 * Guarda lista paginada en el caché (TTL corto: 5 min)
	 */
	async setList(
		query: TenantQueryDto,
		data: [TenantSchema[], number],
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(query),
			data,
			this.cacheService.CACHE_TIMES.MINUTE * 5,
		);
	}

	/**
	 * Invalida todas las listas paginadas
	 */
	async invalidateLists(): Promise<void> {
		await this.cacheService.deleteByPattern(`${this.PREFIX}:list:*`);
	}
}
