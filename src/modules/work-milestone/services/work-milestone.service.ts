import { paginator } from "@infrastructure/utils/server";
import { WorkExperienceCache } from "@modules/work-experience/cache/work-experience.cache";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { WorkMilestoneCache } from "../cache/work-milestone.cache";
import type { WorkMilestoneQueryDto } from "../dtos/work-milestone.query.dto";
import type { WorkMilestoneIndexResponseDto } from "../dtos/work-milestone.response.dto";
import type { WorkMilestoneStoreDto } from "../dtos/work-milestone.store.dto";
import type { WorkMilestoneUpdateDto } from "../dtos/work-milestone.update.dto";
import { WorkMilestoneRepository } from "../repositories/work-milestone.repository";
import type { WorkMilestoneSchema } from "../schemas/work-milestone.schema";

@Injectable()
export class WorkMilestoneService {
	private readonly logger = new Logger(WorkMilestoneService.name);

	constructor(
		private readonly workMilestoneRepository: WorkMilestoneRepository,
		private readonly workMilestoneCache: WorkMilestoneCache,
		private readonly workExperienceCache: WorkExperienceCache,
	) {}

	async index(
		tenant_id: number,
		query: WorkMilestoneQueryDto,
	): Promise<WorkMilestoneIndexResponseDto> {
		const res = await paginator<WorkMilestoneQueryDto, WorkMilestoneSchema>(
			"/api/milestones",
			{
				filters: query,
				cb: async (filters, isClean) => {
					// Basic cache logic or DB
					// For simplicity, hitting DB. Cache logic in previous code was:
					// const cached = await this.workMilestoneCache.getList(tenant_id, query);
					// if (cached) return { success: true, milestones: cached }; -> This was returning raw list!
					// If we switch to paginator, cache should store PaginatorResult or we simplify and just cache DB result inside callback?
					// paginator helper handles caching if we put it inside cb? No, paginator helper doesn't cache.
					// We can wrap repository call with cache.
					// But repository now returns [T[], number].
					// Service previously cached `WorkMilestoneSchema[]`.
					// If I want to keep cache, I should cache the [T[], number] or just invalidation.
					// Leaving cache out for index to ensure correctness with pagination first, can add later.
					return await this.workMilestoneRepository.index(tenant_id, filters);
				},
			},
		);

		return res;
	}

	async store(
		tenant_id: number,
		body: WorkMilestoneStoreDto,
	): Promise<{ success: true; milestone: WorkMilestoneSchema }> {
		this.logger.log({ tenant_id }, "Creating work milestone");
		const milestone = await this.workMilestoneRepository.store(tenant_id, body);

		// Cache Write-Through + Invalidate lists
		await this.workMilestoneCache.set(tenant_id, milestone);
		await this.workMilestoneCache.invalidateLists(tenant_id);

		// Cross-module invalidation: Invalidate experiences list because they render milestones
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, milestone: milestone };
	}

	async update(
		tenant_id: number,
		id: number,
		body: WorkMilestoneUpdateDto,
	): Promise<{ success: true; milestone: WorkMilestoneSchema }> {
		this.logger.log({ tenant_id, id }, "Updating work milestone");

		// Check if exists
		const existing = await this.workMilestoneRepository.showById(tenant_id, id);
		if (!existing) {
			throw new NotFoundException(`Milestone #${id} not found`);
		}

		const milestone = await this.workMilestoneRepository.update(
			tenant_id,
			id,
			body,
		);

		// Invalidate single + lists
		await this.workMilestoneCache.invalidate(tenant_id, id);
		await this.workMilestoneCache.invalidateLists(tenant_id);

		// Cross-module invalidation
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, milestone: milestone };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<{ success: true; message: string }> {
		this.logger.log({ tenant_id, id }, "Deleting work milestone");

		// Check if exists
		const existing = await this.workMilestoneRepository.showById(tenant_id, id);
		if (!existing) {
			throw new NotFoundException(`Milestone #${id} not found`);
		}

		await this.workMilestoneRepository.destroy(tenant_id, id);

		// Invalidate single + lists
		await this.workMilestoneCache.invalidate(tenant_id, id);
		await this.workMilestoneCache.invalidateLists(tenant_id);

		// Cross-module invalidation
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, message: "Milestone deleted successfully" };
	}
}
