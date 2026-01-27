import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { paginator } from "@infrastructure/utils/server";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { BlogCategoryCache } from "../cache/blog-category.cache";
import type { BlogCategoryQueryDto } from "../dtos/blog-category.query.dto";
import type {
	BlogCategoryDestroyResponseDto,
	BlogCategoryIndexResponseDto,
	BlogCategoryShowResponseDto,
	BlogCategoryStoreResponseDto,
	BlogCategoryUpdateResponseDto,
} from "../dtos/blog-category.response.dto";
import type { BlogCategoryStoreDto } from "../dtos/blog-category.store.dto";
import type { BlogCategoryUpdateDto } from "../dtos/blog-category.update.dto";
import { BlogCategoryRepository } from "../repositories/blog-category.repository";
import type { BlogCategorySchema } from "../schemas/blog-category.schema";

@Injectable()
export class BlogCategoryService {
	private readonly logger = new Logger(BlogCategoryService.name);

	constructor(
		private readonly repository: BlogCategoryRepository,
		private readonly blogCategoryCache: BlogCategoryCache,
	) {}

	async index(
		tenant_id: number,
		query: BlogCategoryQueryDto,
	): Promise<BlogCategoryIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing blog categories");

		return await paginator<BlogCategoryQueryDto, BlogCategorySchema>(
			"/blog-category",
			{
				filters: query,
				cb: async (filters: BlogCategoryQueryDto, isClean: boolean) => {
					if (isClean) {
						const cached =
							await this.blogCategoryCache.getList<BlogCategorySchema>(
								tenant_id,
								filters,
							);
						if (cached) return cached;
					}
					const result = await this.repository.index(tenant_id, filters);
					if (isClean) {
						await this.blogCategoryCache.setList(tenant_id, filters, result);
					}
					return result;
				},
			},
		);
	}

	async show(
		tenant_id: number,
		id: number,
	): Promise<BlogCategoryShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Fetching blog category by ID");

		// 1. Try Cache
		let category = await this.blogCategoryCache.get(tenant_id, id);

		if (!category) {
			// 2. Try DB
			category = await this.repository.showById(tenant_id, id);

			if (!category) {
				this.logger.warn({ tenant_id, id }, "Blog category not found");
				throw new NotFoundException(`Blog category with ID ${id} not found`);
			}
			// 3. Set Cache
			await this.blogCategoryCache.set(tenant_id, category);
		}

		return { success: true, category };
	}

	async store(
		tenant_id: number,
		body: BlogCategoryStoreDto,
	): Promise<BlogCategoryStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating blog category");
		const slug = slugify(body.name);
		const category = await this.repository.store(tenant_id, { ...body, slug });

		// Cache Write-Through + Invalidate lists
		await this.blogCategoryCache.invalidateLists(tenant_id);

		return { success: true, category };
	}

	async update(
		tenant_id: number,
		id: number,
		body: BlogCategoryUpdateDto,
	): Promise<BlogCategoryUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating blog category");

		const updates: Partial<BlogCategorySchema> = { ...body };
		if (body.name) {
			updates.slug = slugify(body.name);
		}

		const category = await this.repository.update(tenant_id, id, updates);

		// Invalidate single + lists
		await this.blogCategoryCache.invalidate(tenant_id, id);
		await this.blogCategoryCache.invalidateLists(tenant_id);

		return { success: true, category };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<BlogCategoryDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting blog category");

		const hasPosts = await this.repository.hasPosts(tenant_id, id);
		if (hasPosts) {
			throw new BadRequestException(
				"Cannot delete category because it has associated posts",
			);
		}

		const result = await this.repository.destroy(tenant_id, id);
		if (!result) {
			this.logger.warn(
				{ tenant_id, id },
				"Blog category not found for deletion",
			);
			throw new NotFoundException(`Blog category with ID ${id} not found`);
		}

		// Invalidate single + lists
		await this.blogCategoryCache.invalidate(tenant_id, id);
		await this.blogCategoryCache.invalidateLists(tenant_id);

		return { success: true, message: "Blog category deleted successfully" };
	}
}
