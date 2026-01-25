import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { WorkMilestoneQueryDto } from "../dtos/work-milestone.query.dto";
import type { WorkMilestoneSchema } from "../schemas/work-milestone.schema"; // corrected import path

@Injectable()
export class WorkMilestoneCache {
	private readonly PREFIX = "work-milestone";

	constructor(private readonly cacheService: CacheService) {}

	private getKey(tenant_id: number, id: number): string {
		return `${this.PREFIX}:${tenant_id}:${id}`;
	}

	private getListKey(tenant_id: number, query: WorkMilestoneQueryDto): string {
		return `${this.PREFIX}:${tenant_id}:list:${JSON.stringify(query)}`;
	}

	async get(
		tenant_id: number,
		id: number,
	): Promise<WorkMilestoneSchema | null> {
		const cache = await this.cacheService.get<WorkMilestoneSchema>(
			this.getKey(tenant_id, id),
		);
		return toNull(cache);
	}

	async set(tenant_id: number, milestone: WorkMilestoneSchema): Promise<void> {
		// 24h TTL as per rules for lists mostly, but individual items can also be cached
		// Rules table says "cache (24h TTL)" for GET /milestones.
		await this.cacheService.set(
			this.getKey(tenant_id, milestone.id),
			milestone,
			this.cacheService.CACHE_TIMES.DAYS_1,
		);
	}

	async getList(
		tenant_id: number,
		query: WorkMilestoneQueryDto,
	): Promise<WorkMilestoneSchema[] | null> {
		const cache = await this.cacheService.get<WorkMilestoneSchema[]>(
			this.getListKey(tenant_id, query),
		);
		return cache || null;
	}

	async setList(
		tenant_id: number,
		query: WorkMilestoneQueryDto,
		milestones: WorkMilestoneSchema[],
	): Promise<void> {
		await this.cacheService.set(
			this.getListKey(tenant_id, query),
			milestones,
			this.cacheService.CACHE_TIMES.DAYS_1,
		);
	}

	async invalidate(tenant_id: number, id: number): Promise<void> {
		await this.cacheService.del(this.getKey(tenant_id, id));
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		const pattern = `${this.PREFIX}:${tenant_id}:list:*`;
		await this.cacheService.deleteByPattern(pattern);
	}
}
