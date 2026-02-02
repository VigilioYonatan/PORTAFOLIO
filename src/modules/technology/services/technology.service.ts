import { paginator } from "@infrastructure/utils/server";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TechnologyCache } from "../cache/technology.cache";
import type { TechnologyQueryDto } from "../dtos/technology.query.dto";
import type {
	TechnologyDestroyResponseDto,
	TechnologyIndexResponseDto,
	TechnologyShowResponseDto,
	TechnologyStoreResponseDto,
	TechnologyUpdateResponseDto,
} from "../dtos/technology.response.dto";
import type { TechnologyStoreDto } from "../dtos/technology.store.dto";
import type { TechnologyUpdateDto } from "../dtos/technology.update.dto";
import { TechnologyRepository } from "../repositories/technology.repository";
import type { TechnologySchema } from "../schemas/technology.schema";

@Injectable()
export class TechnologyService {
	private readonly logger = new Logger(TechnologyService.name);

	constructor(
		private readonly repository: TechnologyRepository,
		private readonly technologyCache: TechnologyCache,
	) {}

	async index(
		tenant_id: number,
		query: TechnologyQueryDto,
	): Promise<TechnologyIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing technologies");

		return await paginator<TechnologyQueryDto, TechnologySchema>(
			"/technologies",
			{
				filters: query,
				cb: async (filters, isClean) => {
					if (isClean) {
						const cached = await this.technologyCache.getList<
							[TechnologySchema[], number]
						>(tenant_id, filters);
						if (cached) return cached;
					}

					const result = await this.repository.index(tenant_id, filters);

					if (isClean) {
						await this.technologyCache.setList(tenant_id, filters, result);
					}

					return result;
				},
			},
		);
	}

	async store(
		tenant_id: number,
		body: TechnologyStoreDto,
	): Promise<TechnologyStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating technology");
		const technology = await this.repository.store(tenant_id, body);

		await this.technologyCache.invalidateLists(tenant_id);

		return { success: true, technology };
	}

	async update(
		tenant_id: number,
		id: number,
		body: TechnologyUpdateDto,
	): Promise<TechnologyUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating technology");

		await this.show(tenant_id, id);

		const technology = await this.repository.update(tenant_id, id, body);

		await this.technologyCache.invalidate(tenant_id, id);
		await this.technologyCache.invalidateLists(tenant_id);

		return { success: true, technology };
	}

	async show(
		tenant_id: number,
		id: number,
	): Promise<TechnologyShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Fetching technology by ID");

		let technology = await this.technologyCache.get(tenant_id, id);

		if (!technology) {
			technology = await this.repository.showById(tenant_id, id);

			if (!technology) {
				this.logger.warn({ tenant_id, id }, "Technology not found");
				throw new NotFoundException(
					`Technology #${id} not found for tenant #${tenant_id}`,
				);
			}

			await this.technologyCache.set(tenant_id, technology);
		}

		return { success: true, technology };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<TechnologyDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting technology");

		// Check existence first to distinguish between "not found" and "deletion error"
		await this.show(tenant_id, id);

		const technology = await this.repository.destroy(tenant_id, id);

		if (!technology) {
			this.logger.error(
				{ tenant_id, id },
				"Technology NOT FOUND for deletion after initial check. This suggests it was deleted by another process or there is a database issue.",
			);
			throw new NotFoundException(`Technology #${id} not found`);
		}

		await this.technologyCache.invalidate(tenant_id, id);
		await this.technologyCache.invalidateLists(tenant_id);

		return { success: true, message: "Technology deleted successfully" };
	}
}
