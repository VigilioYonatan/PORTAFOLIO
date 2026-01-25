import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { paginator } from "@infrastructure/utils/server";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { BlogPostCache } from "../cache/blog-post.cache";
import { type BlogPostQueryDto } from "../dtos/blog-post.query.dto";
import type {
	BlogPostDestroyResponseDto,
	BlogPostIndexResponseDto,
	BlogPostShowResponseDto,
	BlogPostStoreResponseDto,
	BlogPostUpdateResponseDto,
} from "../dtos/blog-post.response.dto";
import { type BlogPostStoreDto } from "../dtos/blog-post.store.dto";
import { type BlogPostUpdateDto } from "../dtos/blog-post.update.dto";
import { BlogPostRepository } from "../repositories/blog-post.repository";
import { type BlogPostSchema } from "../schemas/blog-post.schema";

@Injectable()
export class BlogPostService {
	private readonly logger = new Logger(BlogPostService.name);

	constructor(
		private readonly repository: BlogPostRepository,
		private readonly blogPostCache: BlogPostCache,
	) {}

	async store(
		tenant_id: number,
		userId: number,
		body: BlogPostStoreDto,
	): Promise<BlogPostStoreResponseDto> {
		this.logger.log({ tenant_id, userId }, "Creating blog post");
		const slug = slugify(body.title);

		const blogPost = await this.repository.store(tenant_id, userId, {
			...body,
			slug,
		});

		await this.blogPostCache.set(tenant_id, blogPost.id, blogPost);
		await this.blogPostCache.setBySlug(tenant_id, blogPost.slug, blogPost);
		await this.blogPostCache.invalidateLists(tenant_id);

		return { success: true, post: blogPost };
	}

	async update(
		tenant_id: number,
		id: number,
		body: BlogPostUpdateDto,
	): Promise<BlogPostUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating blog post");
		const blogPost = await this.repository.update(tenant_id, id, body);

		if (!blogPost) {
			this.logger.warn({ tenant_id, id }, "Blog post not found for update");
			throw new NotFoundException("Blog post not found");
		}

		await this.blogPostCache.set(tenant_id, blogPost.id, blogPost);
		await this.blogPostCache.setBySlug(tenant_id, blogPost.slug, blogPost);
		await this.blogPostCache.invalidateLists(tenant_id);

		return { success: true, post: blogPost };
	}

	async show(tenant_id: number, id: number): Promise<BlogPostShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Fetching blog post by ID");

		let blogPost = await this.blogPostCache.get(tenant_id, id);

		if (!blogPost) {
			blogPost = await this.repository.showById(tenant_id, id);
			if (blogPost) {
				await this.blogPostCache.set(tenant_id, blogPost.id, blogPost);
			}
		}

		if (!blogPost) {
			this.logger.warn({ tenant_id, id }, "Blog post not found by ID");
			throw new NotFoundException("Blog post not found");
		}

		return { success: true, post: blogPost };
	}

	async showBySlug(
		tenant_id: number,
		slug: string,
	): Promise<BlogPostShowResponseDto> {
		this.logger.log({ tenant_id, slug }, "Fetching blog post by slug");

		let blogPost = await this.blogPostCache.getBySlug(tenant_id, slug);

		if (!blogPost) {
			blogPost = await this.repository.showBySlug(tenant_id, slug);
			if (blogPost) {
				await this.blogPostCache.setBySlug(tenant_id, blogPost.slug, blogPost);
			}
		}

		if (!blogPost) {
			this.logger.warn({ tenant_id, slug }, "Blog post not found by slug");
			throw new NotFoundException("Blog post not found");
		}

		return { success: true, post: blogPost };
	}

	async index(
		tenant_id: number,
		query: BlogPostQueryDto,
	): Promise<BlogPostIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing blog posts");

		return paginator<BlogPostQueryDto, BlogPostSchema>("/blog/posts", {
			filters: query,
			cb: async (filters, isClean) => {
				if (isClean) {
					const cached = await this.blogPostCache.getList<
						[BlogPostSchema[], number]
					>(tenant_id, JSON.stringify(filters));
					if (cached) return cached;
				}

				const [data, total] = await this.repository.index(
					tenant_id,
					filters.limit ?? 10,
					filters.offset ?? 0,
					filters.search,
					filters.category_id,
					filters.is_published,
				);

				if (isClean) {
					await this.blogPostCache.setList(tenant_id, JSON.stringify(filters), [
						data,
						total,
					]);
				}

				return [data, total];
			},
		});
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<BlogPostDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting blog post");
		const blogPost = await this.repository.destroy(tenant_id, id);

		if (!blogPost) {
			this.logger.warn({ tenant_id, id }, "Blog post not found for deletion");
			throw new NotFoundException("Blog post not found");
		}

		await this.blogPostCache.invalidate(tenant_id, id, blogPost.slug);
		await this.blogPostCache.invalidateLists(tenant_id);

		return {
			success: true,
			message: "Post deleted successfully",
		};
	}
}
