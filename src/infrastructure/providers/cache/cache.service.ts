import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import type { Cache } from "cache-manager";

@Injectable()
export class CacheService {
	public readonly CACHE_TIMES = {
		MINUTE: 60 * 1, //1 minuto
		MINUTES_10: 60 * 10, //10 minutos
		MINUTES_30: 60 * 30, //30 minutos
		SIGNED_URL: 60 * 50, //50 minutos (URLs firmadas S3)
		HOUR: 60 * 60, //1 hora
		HOURS_4: 60 * 60 * 4, //4 horas
		DAYS_1: 60 * 60 * 24, //8 horas
		DAYS_3: 60 * 60 * 24 * 3, //3 dias
		DAYS_7: 60 * 60 * 24 * 7, //7 dias
		DAYS_30: 60 * 60 * 24 * 30, //30 dias
	};
	constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
	async get<T>(key: string): Promise<T | undefined> {
		return await this.cacheManager.get<T>(key);
	}

	async set(key: string, value: unknown, ttl?: number): Promise<void> {
		// Aquí podrías centralizar lógica de TTL por defecto
		await this.cacheManager.set(key, value, ttl);
	}

	async remember<T>(
		key: string,
		ttl: number,
		callback: () => Promise<T>,
	): Promise<T> {
		const cached = await this.get<T>(key);
		if (cached) {
			return cached;
		}

		const value = await callback();
		// Solo guardamos si el valor no es nulo/undefined (opcional, según lógica negocio)
		if (value !== undefined && value !== null) {
			await this.set(key, value, ttl);
		}
		return value;
	}

	async del(key: string): Promise<void> {
		await this.cacheManager.del(key);
	}

	async deleteByPattern(pattern: string): Promise<void> {
		// biome-ignore lint/suspicious/noExplicitAny: Cache Manager internals
		const store = (this.cacheManager as any).store;
		if (!store) {
			return;
		}
		const prefix = pattern.replace("*", "");

		// 1. Memory Store (Development)
		if (typeof store.keys === "function") {
			const keys: string[] = await store.keys();
			const matches = keys.filter((key) => key.startsWith(prefix));
			await Promise.all(matches.map((key) => this.del(key)));
			return;
		}

		// 2. Keyv / Redis (Production)
		if (typeof store.iterator === "function") {
			try {
				// Keyv iterator yield [key, value]
				for await (const [key] of store.iterator()) {
					if (key.startsWith(prefix)) {
						await this.del(key);
					}
				}
			} catch (error) {
				// biome-ignore lint/suspicious/noConsole: Log error
				console.error("Error detecting/deleting keys in Keyv iterator:", error);
			}
		}
	}

	// --- HEALTH CHECK ---
	async checkHealth(): Promise<boolean> {
		try {
			await this.cacheManager.set("health_check", "ok", 1000);
			const result = await this.cacheManager.get("health_check");
			return result === "ok";
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: Health check log
			console.error("Redis Health Check Failed:", error);
			return false;
		}
	}

	async resetCache(): Promise<void> {
		await this.cacheManager.clear();
	}
}
