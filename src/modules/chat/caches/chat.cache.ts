import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { ConversationQueryDto } from "../dtos/chat.class.dto";
import type { ConversationSchema } from "../schemas/conversation.schema";

@Injectable()
export class ChatCache {
	private readonly PREFIX = "chat";

	constructor(private readonly cacheService: CacheService) {}

	private getListKey(tenant_id: number, query: ConversationQueryDto): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(query)}`;
	}

	async getList(
		tenant_id: number,
		query: ConversationQueryDto,
	): Promise<[ConversationSchema[], number] | null> {
		const cache = await this.cacheService.get<[ConversationSchema[], number]>(
			this.getListKey(tenant_id, query),
		);
		return toNull(cache);
	}

	async setList(
		tenant_id: number,
		query: ConversationQueryDto,
		data: [ConversationSchema[], number],
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			data,
			this.cacheService.CACHE_TIMES.MINUTE, // Chat list is dynamic
		);
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:list:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
