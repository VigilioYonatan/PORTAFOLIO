import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { NotificationQueryDto } from "../dtos/notification.query.dto";
import type { NotificationSchema } from "../schemas/notification.schema";

@Injectable()
export class NotificationCache {
	private readonly PREFIX = "notification";

	constructor(private readonly cacheService: CacheService) {}

	private getListKey(tenant_id: number, query: NotificationQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
	}

	async getList(
		tenant_id: number,
		query: NotificationQueryDto,
	): Promise<[NotificationSchema[], number] | null> {
		const cache = await this.cacheService.get<[NotificationSchema[], number]>(
			this.getListKey(tenant_id, query),
		);
		return toNull(cache);
	}

	async setList(
		tenant_id: number,
		query: NotificationQueryDto,
		data: [NotificationSchema[], number],
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			data,
			this.cacheService.CACHE_TIMES.MINUTES_10, // Notifications can wait a bit
		);
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:list:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
