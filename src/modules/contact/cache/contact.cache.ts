import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { ContactQueryDto } from "../dtos/contact.query.dto";
import type { ContactMessageSchema } from "../schemas/contact-message.schema";

@Injectable()
export class ContactCache {
	private readonly PREFIX = "contact";

	constructor(private readonly cacheService: CacheService) {}

	/**
	 * Genera la key de caché con aislamiento multi-tenant
	 */
	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	/**
	 * Genera la key de caché para listas paginadas
	 */
	private getListKey(tenant_id: number, query: ContactQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
	}

	/**
	 * Obtiene un mensaje del caché
	 */
	async get(
		tenant_id: number,
		id: number,
	): Promise<ContactMessageSchema | null> {
		const cache = await this.cacheService.get<ContactMessageSchema>(
			this.getKey(tenant_id, id),
		);
		return toNull(cache);
	}

	/**
	 * Guarda un mensaje en el caché
	 */
	async set(tenant_id: number, message: ContactMessageSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id, message.id),
			message,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	/**
	 * Invalida un mensaje específico del caché
	 */
	async invalidate(tenant_id: number, id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id, id));
	}

	/**
	 * Obtiene lista paginada del caché
	 */
	async getList(
		tenant_id: number,
		query: ContactQueryDto,
	): Promise<[ContactMessageSchema[], number] | null> {
		const cache = await this.cacheService.get<[ContactMessageSchema[], number]>(
			this.getListKey(tenant_id, query),
		);
		return toNull(cache);
	}

	/**
	 * Guarda lista paginada en el caché (TTL corto: 5 min)
	 */
	async setList(
		tenant_id: number,
		query: ContactQueryDto,
		data: [ContactMessageSchema[], number],
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			data,
			this.cacheService.CACHE_TIMES.MINUTE * 5,
		);
	}

	/**
	 * Invalida todas las listas paginadas de un tenant
	 */
	async invalidateLists(tenant_id: number): Promise<void> {
		await this.cacheService.deleteByPattern(
			`${this.PREFIX}:list:${tenant_id}:*`,
		);
	}
}
