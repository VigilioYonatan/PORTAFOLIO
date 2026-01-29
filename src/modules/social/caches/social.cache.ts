import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { Injectable } from "@nestjs/common";
import type { SocialCommentQueryDto } from "../dtos/social-comment.query.dto";
import type { SocialReactionSchema } from "../schemas/social-reaction.schema";

@Injectable()
export class SocialCache {
	private readonly PREFIX = "social";

	constructor(private readonly cacheService: CacheService) {}

	private getReactionKey(
		target_id: number,
		target_type: SocialReactionSchema["reactable_type"],
	): string {
		return `${this.PREFIX}:reactions:${target_type}:${target_id}`;
	}

	async getReactionCounts(
		reactable_id: number,
		reactable_type: SocialReactionSchema["reactable_type"],
	): Promise<Record<string, number> | null> {
		const cached = await this.cacheService.get<Record<string, number>>(
			this.getReactionKey(reactable_id, reactable_type),
		);
		return cached || null;
	}

	async setReactionCounts(
		target_id: number,
		target_type: SocialReactionSchema["reactable_type"],
		counts: Record<string, number>,
	): Promise<void> {
		await this.cacheService.set(
			this.getReactionKey(target_id, target_type),
			counts,
			this.cacheService.CACHE_TIMES.MINUTE, // 1 min TTL
		);
	}

	async invalidateReactionCounts(
		target_id: number,
		target_type: SocialReactionSchema["reactable_type"],
	): Promise<void> {
		await this.cacheService.del(this.getReactionKey(target_id, target_type));
	}

	// --- Comments List Cache ---

	private getListKey(
		tenant_id: number,
		filters: Record<string, unknown>,
	): string {
		return `${this.PREFIX}:list:${tenant_id}:${JSON.stringify(filters)}`;
	}

	async getList<T>(
		tenant_id: number,
		filters: SocialCommentQueryDto,
	): Promise<T | null> {
		const cached = await this.cacheService.get<T>(
			this.getListKey(tenant_id, filters),
		);
		return cached || null;
	}

	async setList<T>(
		tenant_id: number,
		filters: SocialCommentQueryDto,
		data: T,
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, filters),
			data,
			this.cacheService.CACHE_TIMES.MINUTE, // 1 min per requirement
		);
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:list:${tenant_id}:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
