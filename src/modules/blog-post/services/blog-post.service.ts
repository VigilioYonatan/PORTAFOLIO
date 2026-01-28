import { AI_TECHNICAL_PROTECTION } from "@modules/ai/const/ai-prompts.const";
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
import { AiService } from "@modules/ai/services/ai.service";

@Injectable()
export class BlogPostService {
	private readonly logger = new Logger(BlogPostService.name);

	constructor(
		private readonly repository: BlogPostRepository,
		private readonly blogPostCache: BlogPostCache,
		private readonly aiService: AiService,
	) {}

	async store(
		tenant_id: number,
		userId: number,
		body: BlogPostStoreDto,
	): Promise<BlogPostStoreResponseDto> {
		this.logger.log({ tenant_id, userId }, "Creating blog post");
		const slug = slugify(body.title);

		const blogPost = await this.repository.store(tenant_id, {
			...body,
			slug,
			author_id: userId,
			language: "es",
			parent_id: null,
		});

		// Auto-translate if original is Spanish
		this.generateTranslations(tenant_id, userId, blogPost).catch((err) =>
			this.logger.error("Error generating translations", err),
		);

		await this.blogPostCache.invalidateLists(tenant_id);

		return { success: true, post: blogPost };
	}

	private async generateTranslations(
		tenant_id: number,
		userId: number,
		originalPost: BlogPostSchema,
	) {
		const targetLanguages = ["en", "pt"];

		const translations = await Promise.all(
			targetLanguages.map(async (lang) => {
				try {
					const prompt = `
					Translate the following blog post content to ${lang === "en" ? "English" : "Portuguese"}.
					${AI_TECHNICAL_PROTECTION}
					
					Return a JSON object with the following structure:
					{
						"title": "Translated Title",
						"content": "Translated Content (Markdown)",
						"extract": "Translated Extract",
						"slug": "translated-slug"
					}
					Original Data:
					Title: ${originalPost.title}
					Content: ${originalPost.content}
					Extract: ${originalPost.extract || ""}
				`;

					const jsonResponse = await this.aiService.generate({
						model: "openai/gpt-4o-mini",
						temperature: 0.3,
						system: "You are a professional translator. Return only valid JSON.",
						messages: [{ role: "user", content: prompt }],
					});

					const cleanJson = jsonResponse.replace(/```json|```/g, "").trim();
					const translated = JSON.parse(cleanJson);

					const { id, created_at, updated_at, tenant_id: t_id, ...rest } = originalPost;

					return {
						...rest,
						title: translated.title,
						content: translated.content,
						extract: translated.extract,
						slug: translated.slug,
						language: lang as "en" | "pt",
						parent_id: originalPost.id,
					};
				} catch (error) {
					this.logger.error(
						`Failed to translate post #${originalPost.id} to ${lang}`,
						error,
					);
					return null;
				}
			}),
		);

		const validTranslations = translations.filter((t) => t !== null);
		if (validTranslations.length > 0) {
			await this.repository.bulkStore(tenant_id, validTranslations);
			this.logger.log(
				`Created ${validTranslations.length} translations for post #${originalPost.id}`,
			);
		}
	}

	async update(
		tenant_id: number,
		id: number,
		body: BlogPostUpdateDto,
	): Promise<BlogPostUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating blog post");

		const updates: Partial<BlogPostSchema> = { ...body };
		if (body.title) {
			updates.slug = slugify(body.title);
		}

		const blogPost = await this.repository.update(tenant_id, id, updates);

		if (!blogPost) {
			this.logger.warn({ tenant_id, id }, "Blog post not found for update");
			throw new NotFoundException("Blog post not found");
		}

		await this.blogPostCache.invalidate(tenant_id, blogPost.id, blogPost.slug);
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
				// If clean query, try cache first
				if (isClean) {
					const cached = await this.blogPostCache.getList<
						[BlogPostSchema[], number]
					>(tenant_id, filters);
					if (cached) return cached;
				}

				const result = await this.repository.index(tenant_id, filters);

				if (isClean) {
					await this.blogPostCache.setList(tenant_id, filters, result);
				}

				return result;
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
