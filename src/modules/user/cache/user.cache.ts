import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { UserQueryDto } from "../dtos/user.query.dto";
import type {
	UserIndexSchema,
	UserShowByEmailToLoginSchema,
	UserShowSchema,
} from "../schemas/user.schema";

@Injectable()
export class UserCache {
	private readonly PREFIX = "user";

	constructor(private readonly cacheService: CacheService) {}

	/**
	 * Genera la key de caché con aislamiento multi-tenant
	 */
	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	/**
	 * Genera la key de caché por email con aislamiento multi-tenant
	 */
	private getKeyByEmail(tenant_id: number, email: string): string {
		return `${this.PREFIX}:${tenant_id}:email:${email}`;
	}

	/**
	 * Genera la key de caché para listas paginadas
	 */
	private getListKey(tenant_id: number, query: UserQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
	}

	/**
	 * Obtiene un usuario del caché (Safe - No Password)
	 */
	async get(tenant_id: number, id: number): Promise<UserShowSchema | null> {
		const cache = await this.cacheService.get<UserShowSchema>(
			this.getKey(tenant_id, id),
		);
		return toNull(cache);
	}

	/**
	 * Guarda un usuario en el caché (Safe - No Password)
	 */
	async set(tenant_id: number, user: UserShowSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id, user.id),
			user,
			this.cacheService.CACHE_TIMES.MINUTE * 5,
		);
	}

	/**
	 * Obtiene un usuario del caché por email
	 */
	async getByEmail(
		tenant_id: number,
		email: string,
	): Promise<UserShowByEmailToLoginSchema | null> {
		const cache = await this.cacheService.get<UserShowByEmailToLoginSchema>(
			this.getKeyByEmail(tenant_id, email),
		);
		return toNull(cache);
	}

	/**
	 * Guarda un usuario en el caché por email
	 */
	async setByEmail(
		tenant_id: number,
		email: string,
		user: UserShowByEmailToLoginSchema,
	): Promise<void> {
		await this.cacheService.set(
			this.getKeyByEmail(tenant_id, email),
			user,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	/**
	 * Invalida un usuario específico del caché por email
	 */
	async invalidateByEmail(tenant_id: number, email: string): Promise<void> {
		await this.cacheService.del(this.getKeyByEmail(tenant_id, email));
	}

	/**
	 * Invalida un usuario específico del caché
	 */
	async invalidate(tenant_id: number, id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id, id));
	}

	/**
	 * Invalida todos los usuarios de un tenant
	 */
	async invalidateByTenant(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}

	/**
	 * Obtiene lista paginada del caché
	 */
	async getList(
		tenant_id: number,
		query: UserQueryDto,
	): Promise<[UserIndexSchema[], number] | null> {
		const cache = await this.cacheService.get<[UserIndexSchema[], number]>(
			this.getListKey(tenant_id, query),
		);
		return toNull(cache);
	}

	/**
	 * Guarda lista paginada en el caché (TTL corto: 5 min)
	 */
	async setList(
		tenant_id: number,
		query: UserQueryDto,
		data: [UserIndexSchema[], number],
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
