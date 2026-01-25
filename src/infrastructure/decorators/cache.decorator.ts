import { applyDecorators, SetMetadata, UseInterceptors } from "@nestjs/common";
import { AppCacheInterceptor } from "../interceptors/app-cache.interceptor";

export interface CacheableOptions {
	key: string;
	ttl?: number;
}

export interface CacheEvictOptions {
	key: string;
}

export const CACHEABLE_KEY = "CACHEABLE";
export const CACHE_EVICT_KEY = "CACHE_EVICT";

export function Cacheable(options: CacheableOptions) {
	return applyDecorators(
		SetMetadata(CACHEABLE_KEY, options),
		UseInterceptors(AppCacheInterceptor),
	);
}

export function CacheEvict(options: CacheEvictOptions) {
	return applyDecorators(
		SetMetadata(CACHE_EVICT_KEY, options),
		UseInterceptors(AppCacheInterceptor),
	);
}
