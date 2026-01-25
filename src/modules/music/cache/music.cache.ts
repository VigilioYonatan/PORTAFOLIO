import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import { type MusicQueryDto } from "../dtos/music.query.dto";
import { type MusicTrackSchema } from "../schemas/music.schema";

@Injectable()
export class MusicTrackCache {
	private readonly PREFIX = "music_track";

	constructor(private readonly cacheService: CacheService) {}

	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	private getListKey(tenant_id: number, query: MusicQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
	}

	async get(tenant_id: number, id: number): Promise<MusicTrackSchema | null> {
		const cache = await this.cacheService.get<MusicTrackSchema>(
			this.getKey(tenant_id, id),
		);
		return toNull(cache);
	}

	async set(tenant_id: number, music: MusicTrackSchema): Promise<void> {
		await this.cacheService.set(
			this.getKey(tenant_id, music.id as number),
			music,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	async getList<T>(tenant_id: number, query: MusicQueryDto): Promise<T | null> {
		const result = await this.cacheService.get(
			this.getListKey(tenant_id, query),
		);
		return result as T | null;
	}

	async setList<T>(
		tenant_id: number,
		query: MusicQueryDto,
		data: T,
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			data,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	async invalidate(tenant_id: number, id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id, id));
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:list:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
