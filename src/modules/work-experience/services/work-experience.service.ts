import { paginator } from "@infrastructure/utils/server";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { WorkExperienceCache } from "../cache/work-experience.cache";
import type { WorkExperienceQueryDto } from "../dtos/work-experience.query.dto";
import type {
	WorkExperienceDestroyResponseDto,
	WorkExperienceIndexResponseDto,
	WorkExperienceShowResponseDto,
	WorkExperienceStoreResponseDto,
	WorkExperienceUpdateResponseDto,
} from "../dtos/work-experience.response.dto";
import type { WorkExperienceStoreDto } from "../dtos/work-experience.store.dto";
import type { WorkExperienceUpdateDto } from "../dtos/work-experience.update.dto";
import { WorkExperienceRepository } from "../repositories/work-experience.repository";
import type { WorkExperienceSchema } from "../schemas/work-experience.schema";

@Injectable()
export class WorkExperienceService {
	private readonly logger = new Logger(WorkExperienceService.name);

	constructor(
		private readonly workExperienceRepository: WorkExperienceRepository,
		private readonly workExperienceCache: WorkExperienceCache,
	) {}

	async index(
		tenant_id: number,
		query?: WorkExperienceQueryDto,
	): Promise<WorkExperienceIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing work experiences");

		return await paginator<WorkExperienceQueryDto, WorkExperienceSchema>(
			"/work-experience",
			{
				filters: query,
				cb: async (filters, isClean) => {
					// If clean query, try cache first
					if (isClean) {
						const cached = await this.workExperienceCache.getList<
							[WorkExperienceSchema[], number]
						>(tenant_id, filters);
						if (cached) return cached;
					}

					const result = await this.workExperienceRepository.index(
						tenant_id,
						filters,
					);

					if (isClean) {
						await this.workExperienceCache.setList(tenant_id, filters, result);
					}

					return result;
				},
			},
		);
	}

	async show(
		tenant_id: number,
		id: number,
	): Promise<WorkExperienceShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Fetching work experience by ID");

		// 1. Try Cache
		let experience = await this.workExperienceCache.get(tenant_id, id);

		if (!experience) {
			// 2. Try DB
			experience = await this.workExperienceRepository.showById(tenant_id, id);

			if (!experience) {
				this.logger.warn({ tenant_id, id }, "Work experience not found");
				throw new NotFoundException(`Work experience #${id} not found`);
			}

			// 3. Set Cache
			await this.workExperienceCache.set(tenant_id, experience);
		}

		return { success: true, experience };
	}

	async store(
		tenant_id: number,
		body: WorkExperienceStoreDto,
	): Promise<WorkExperienceStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating work experience");
		const experience = await this.workExperienceRepository.store(
			tenant_id,
			body,
		);

		// Cache Write-Through + Invalidate lists
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, experience };
	}

	async update(
		tenant_id: number,
		id: number,
		body: WorkExperienceUpdateDto,
	): Promise<WorkExperienceUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating work experience");
		const experience = await this.workExperienceRepository.update(
			tenant_id,
			id,
			body,
		);

		if (!experience) {
			this.logger.warn(
				{ tenant_id, id },
				"Work experience not found for update",
			);
			throw new NotFoundException(`Work experience #${id} not found`);
		}

		// Invalidate single + lists
		await this.workExperienceCache.invalidate(tenant_id, id);
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, experience };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<WorkExperienceDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting work experience");
		const experience = await this.workExperienceRepository.destroy(
			tenant_id,
			id,
		);

		if (!experience) {
			this.logger.warn(
				{ tenant_id, id },
				"Work experience not found for deletion",
			);
			throw new NotFoundException(`Work experience #${id} not found`);
		}

		// Invalidate single + lists
		await this.workExperienceCache.invalidate(tenant_id, experience.id);
		await this.workExperienceCache.invalidateLists(tenant_id);

		return { success: true, message: "Work experience deleted successfully" };
	}
}
