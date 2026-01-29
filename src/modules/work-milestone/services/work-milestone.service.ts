import { paginator } from "@infrastructure/utils/server";
import { WorkExperienceCache } from "@modules/work-experience/cache/work-experience.cache";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { WorkMilestoneCache } from "../cache/work-milestone.cache";
import type { WorkMilestoneQueryDto } from "../dtos/work-milestone.query.dto";
import type {
	WorkMilestoneDestroyResponseDto,
	WorkMilestoneIndexResponseDto,
	WorkMilestoneStoreResponseDto,
	WorkMilestoneUpdateResponseDto,
} from "../dtos/work-milestone.response.dto";
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
		return await paginator<WorkMilestoneQueryDto, WorkMilestoneSchema>(
			"/work-milestone",
			{
				filters: query,
				cb: async (filters, isClean) => {
					// If clean query, try cache first
					if (isClean) {
						const cached = await this.workMilestoneCache.getList(
							tenant_id,
							filters,
						);
						if (cached) return cached;
					}

					const result = await this.workMilestoneRepository.index(
						tenant_id,
						filters,
					);

					if (isClean) {
						await this.workMilestoneCache.setList(tenant_id, filters, result);
					}

					return result;
				},
			},
		);
	}

	async store(
		tenant_id: number,
		body: WorkMilestoneStoreDto,
	): Promise<WorkMilestoneStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating work milestone");
		const milestone = await this.workMilestoneRepository.store(tenant_id, body);

		// Cross-module invalidation: Invalidate experiences list because they render milestones
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, milestone };
	}

	async update(
		tenant_id: number,
		id: number,
		body: WorkMilestoneUpdateDto,
	): Promise<WorkMilestoneUpdateResponseDto> {
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

		// Cross-module invalidation
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, milestone };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<WorkMilestoneDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting work milestone");

		// Check if exists
		const existing = await this.workMilestoneRepository.showById(tenant_id, id);
		if (!existing) {
			throw new NotFoundException(`Milestone #${id} not found`);
		}

		await this.workMilestoneRepository.destroy(tenant_id, id);

		// Invalidate single + lists
		await this.workMilestoneCache.invalidate(tenant_id, id);

		// Cross-module invalidation
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, message: "Milestone deleted successfully" };
	}
}
