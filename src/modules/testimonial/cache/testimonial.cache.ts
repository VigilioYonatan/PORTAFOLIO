import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { TestimonialQueryDto } from "../dtos/testimonial.query.dto";
import type { TestimonialSchema } from "../schemas/testimonial.schema";

@Injectable()
export class TestimonialCache {
	private readonly PREFIX = "testimonial";

	constructor(private readonly cacheService: CacheService) {}

	/**
	 * Genera la key de caché para un testimonio individual
	 */
	private getKey(id: number): string {
		return `${this.PREFIX}:${id}`;
	}

	/**
	 * Genera la key de caché para listas paginadas
	 */
	private getListKey(query: TestimonialQueryDto): string {
		return `${this.PREFIX}:list:${JSON.stringify(query)}`;
	}

	/**
	 * Obtiene un testimonio del caché
	 */
	async get(id: number): Promise<TestimonialSchema | null> {
		const cache = await this.cacheService.get<TestimonialSchema>(
			this.getKey(id),
		);
		return toNull(cache);
	}

	/**
	 * Guarda un testimonio en el caché
	 */
	async set(testimonial: TestimonialSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(testimonial.id),
			testimonial,
			this.cacheService.CACHE_TIMES.HOUR, // 1h TTL según spec
		);
	}

	/**
	 * Invalida un testimonio específico del caché
	 */
	async invalidate(id: number): Promise<void> {
		await this.cacheService.del(this.getKey(id));
	}

	/**
	 * Obtiene lista paginada del caché
	 */
	async getList(
		query: TestimonialQueryDto,
	): Promise<[TestimonialSchema[], number] | null> {
		const cache = await this.cacheService.get<[TestimonialSchema[], number]>(
			this.getListKey(query),
		);
		return toNull(cache);
	}

	/**
	 * Guarda lista paginada en el caché (1h TTL para testimonios públicos)
	 */
	async setList(
		query: TestimonialQueryDto,
		data: [TestimonialSchema[], number],
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(query),
			data,
			this.cacheService.CACHE_TIMES.HOUR, // 1h TTL según spec
		);
	}

	/**
	 * Invalida todas las listas paginadas
	 */
	async invalidateLists(): Promise<void> {
		await this.cacheService.deleteByPattern(`${this.PREFIX}:list:*`);
	}
}
