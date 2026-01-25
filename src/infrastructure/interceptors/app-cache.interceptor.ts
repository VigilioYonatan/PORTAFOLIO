import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import {
	type CallHandler,
	type ExecutionContext,
	Inject,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import {
	CACHE_EVICT_KEY,
	CACHEABLE_KEY,
	type CacheableOptions,
	type CacheEvictOptions,
} from "../decorators/cache.decorator";

@Injectable()
export class AppCacheInterceptor implements NestInterceptor {
	constructor(
		private readonly reflector: Reflector,
		@Inject(CACHE_MANAGER) private cache: Cache,
	) {}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<unknown>> {
		const cacheable = this.reflector.get<CacheableOptions>(
			CACHEABLE_KEY,
			context.getHandler(),
		);
		const cacheEvict = this.reflector.get<CacheEvictOptions>(
			CACHE_EVICT_KEY,
			context.getHandler(),
		);

		if (cacheable) {
			const key = this.generateKey(cacheable.key, context);
			const cachedValue = await this.cache.get(key);

			if (cachedValue) {
				return of(cachedValue);
			}

			return next.handle().pipe(
				tap(async (response) => {
					await this.cache.set(key, response, cacheable.ttl || 3600);
				}),
			);
		}

		if (cacheEvict) {
			return next.handle().pipe(
				tap(async () => {
					const key = this.generateKey(cacheEvict.key, context);
					await this.cache.del(key);
				}),
			);
		}

		return next.handle();
	}

	private generateKey(prefix: string, context: ExecutionContext): string {
		const args = context.getArgs();
		// Assuming the first argument is the ID or key part if it's a string
		// This is a simple implementation. For production, might need more robust arg parsing.
		const id = args[0];
		if (typeof id === "string" || typeof id === "number") {
			return `${prefix}:${id}`;
		}
		return prefix;
	}
}
