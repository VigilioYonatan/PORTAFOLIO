import { DRIZZLE } from "@infrastructure/providers/database/database.const";
import { type schema } from "@infrastructure/providers/database/database.schema";
import { Inject, Injectable } from "@nestjs/common";
import type { Lang } from "@src/i18n";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { BlogPostQueryDto } from "../dtos/blog-post.query.dto";
import { blogPostEntity } from "../entities/blog-post.entity";
import { type BlogPostSchema } from "../schemas/blog-post.schema";

@Injectable()
export class BlogPostRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		body: Omit<
			BlogPostSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<BlogPostSchema> {
		const [blogPost] = await this.db
			.insert(blogPostEntity)
			.values({ ...body, tenant_id })
			.returning();
		return blogPost;
	}

	async bulkStore(
		tenant_id: number,
		bodies: Omit<
			BlogPostSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>[],
	): Promise<BlogPostSchema[]> {
		if (bodies.length === 0) return [];
		return await this.db
			.insert(blogPostEntity)
			.values(bodies.map((body) => ({ ...body, tenant_id })))
			.returning();
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<BlogPostSchema>,
	): Promise<BlogPostSchema> {
		const [blogPost] = await this.db
			.update(blogPostEntity)
			.set(body)
			.where(
				and(eq(blogPostEntity.id, id), eq(blogPostEntity.tenant_id, tenant_id)),
			)
			.returning();
		return blogPost;
	}

	async showById(
		tenant_id: number,
		id: number,
	): Promise<BlogPostSchema | null> {
		const blogPost = await this.db.query.blogPostEntity.findFirst({
			where: and(
				eq(blogPostEntity.tenant_id, tenant_id),
				eq(blogPostEntity.id, id),
			),
			with: {
				category: true,
				author: true,
			},
		});
		return blogPost || null;
	}

	async showBySlug(
		tenant_id: number,
		slug: string,
		language?: Lang,
	): Promise<BlogPostSchema | null> {
		const blogPost = await this.db.query.blogPostEntity.findFirst({
			where: and(
				eq(blogPostEntity.tenant_id, tenant_id),
				eq(blogPostEntity.slug, slug),
				language ? eq(blogPostEntity.language, language) : undefined,
			),
			with: {
				category: true,
				author: true,
				translations: true,
				parent: {
					with: {
						translations: true,
					},
				},
			},
		});
		return blogPost || null;
	}

	async index(
		tenant_id: number,
		query: BlogPostQueryDto,
	): Promise<[BlogPostSchema[], number]> {
		const { limit, offset, search, category_id, is_published, language } =
			query;

		const whereClause = and(
			eq(blogPostEntity.tenant_id, tenant_id),
			search ? ilike(blogPostEntity.title, `%${search}%`) : undefined,
			category_id ? eq(blogPostEntity.category_id, category_id) : undefined,
			is_published !== undefined
				? eq(blogPostEntity.is_published, is_published)
				: undefined,
			language ? eq(blogPostEntity.language, language) : undefined,
		);

		const blogPosts = await this.db.query.blogPostEntity.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: [desc(blogPostEntity.id)], // Standardize order
			with: {
				category: true,
				author: true,
			},
			columns: {
				content: false,
			},
			extras: {
				content:
					sql<string>`substring(${blogPostEntity.content} from 1 for 500)`.as(
						"content",
					),
			},
		});

		const total = await this.db
			.select({ total: sql<number>`count(*)` })
			.from(blogPostEntity)
			.where(whereClause)
			.then((res) => Number(res[0].total));

		return [blogPosts as BlogPostSchema[], total];
	}

	async destroy(tenant_id: number, id: number): Promise<BlogPostSchema> {
		const [blogPost] = await this.db
			.delete(blogPostEntity)
			.where(
				and(eq(blogPostEntity.id, id), eq(blogPostEntity.tenant_id, tenant_id)),
			)
			.returning();
		return blogPost;
	}
}
