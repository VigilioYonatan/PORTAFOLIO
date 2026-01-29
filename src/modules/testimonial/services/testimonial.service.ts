import { paginator } from "@infrastructure/utils/server/helpers";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TestimonialCache } from "../cache/testimonial.cache";
import type { TestimonialQueryDto } from "../dtos/testimonial.query.dto";
import type {
	TestimonialDestroyResponseDto,
	TestimonialIndexResponseDto,
	TestimonialStoreResponseDto,
	TestimonialUpdateResponseDto,
} from "../dtos/testimonial.response.dto";
import type { TestimonialStoreDto } from "../dtos/testimonial.store.dto";
import type { TestimonialUpdateDto } from "../dtos/testimonial.update.dto";
import { TestimonialRepository } from "../repositories/testimonial.repository";
import type { TestimonialSchema } from "../schemas/testimonial.schema";

@Injectable()
export class TestimonialService {
	private readonly logger = new Logger(TestimonialService.name);

	constructor(
		private readonly testimonialRepository: TestimonialRepository,
		private readonly testimonialCache: TestimonialCache,
	) {}

	async index(
		tenant_id: number,
		query: TestimonialQueryDto,
	): Promise<TestimonialIndexResponseDto> {
		return await paginator<TestimonialQueryDto, TestimonialSchema>(
			"/testimonials",
			{
				filters: query,
				cb: async (filters, isClean) => {
					// If clean query, try cache first
					if (isClean) {
						const cached = await this.testimonialCache.getList(filters);
						if (cached) {
							this.logger.debug("Returning cached testimonial list");
							return cached;
						}
					}

					// Try DB
					const result = await this.testimonialRepository.index(
						tenant_id,
						filters,
					);

					if (isClean) {
						// Set Cache (Only for clean queries)
						await this.testimonialCache.setList(filters, result);
					}

					return result;
				},
			},
		);
	}

	async store(
		tenant_id: number,
		body: TestimonialStoreDto,
	): Promise<TestimonialStoreResponseDto> {
		this.logger.log({ author_name: body.author_name }, "Creating testimonial");

		const testimonial = await this.testimonialRepository.store(tenant_id, body);

		// Cache Write-Through + Invalidate lists
		await this.testimonialCache.invalidateLists();

		return { success: true, testimonial };
	}

	async update(
		tenant_id: number,
		id: number,
		body: TestimonialUpdateDto,
	): Promise<TestimonialUpdateResponseDto> {
		this.logger.log({ id }, "Updating testimonial");

		// Verificar que existe
		const exists = await this.testimonialRepository.showById(tenant_id, id);
		if (!exists) {
			throw new NotFoundException(`Testimonial #${id} not found`);
		}

		const testimonial = await this.testimonialRepository.update(
			tenant_id,
			id,
			body,
		);

		// Invalidate single + lists
		await this.testimonialCache.invalidate(id);
		await this.testimonialCache.invalidateLists();

		return { success: true, testimonial };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<TestimonialDestroyResponseDto> {
		this.logger.log({ id }, "Deleting testimonial");

		// Verificar que existe
		const exists = await this.testimonialRepository.showById(tenant_id, id);
		if (!exists) {
			throw new NotFoundException(`Testimonial #${id} not found`);
		}

		await this.testimonialRepository.destroy(tenant_id, id);

		// Invalidate single + lists
		await this.testimonialCache.invalidate(id);
		await this.testimonialCache.invalidateLists();

		return { success: true, message: "Testimonial deleted successfully" };
	}
}
