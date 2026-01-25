import { DRIZZLE } from "@infrastructure/providers/database/database.const";
import { type schema } from "@infrastructure/providers/database/database.schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { blogPostEntity } from "../entities/blog-post.entity";
import { type BlogPostSchema } from "../schemas/blog-post.schema";

@Injectable()
export class BlogPostRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async store(
		tenant_id: number,
		user_id: number,
		body: Omit<
			BlogPostSchema,
			"id" | "created_at" | "updated_at" | "tenant_id" | "author_id"
		>,
	): Promise<BlogPostSchema> {
		const [blogPost] = await this.db
			.insert(blogPostEntity)
			.values({ ...body, tenant_id, author_id: user_id })
			.returning();
		return blogPost;
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
	): Promise<BlogPostSchema | null> {
		const blogPost = await this.db.query.blogPostEntity.findFirst({
			where: and(
				eq(blogPostEntity.tenant_id, tenant_id),
				eq(blogPostEntity.slug, slug),
			),
			with: {
				category: true,
				author: true,
			},
		});
		return blogPost || null;
	}

	async index(
		tenant_id: number,
		limit: number,
		offset: number,
		search?: string,
		// filters
		category_id?: number,
		is_published?: boolean,
	): Promise<[BlogPostSchema[], number]> {
		const whereClause = and(
			eq(blogPostEntity.tenant_id, tenant_id),
			search ? sql`${blogPostEntity.title} ILIKE ${`%${search}%`}` : undefined,
			category_id ? eq(blogPostEntity.category_id, category_id) : undefined,
			is_published !== undefined
				? eq(blogPostEntity.is_published, is_published)
				: undefined,
		);

		const blogPosts = await this.db.query.blogPostEntity.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: [desc(blogPostEntity.created_at)],
			with: {
				category: true,
				author: true,
			},
		});

		const [{ total }] = await this.db
			.select({ total: sql<number>`count(*)` })
			.from(blogPostEntity)
			.where(whereClause);

		return [blogPosts as BlogPostSchema[], Number(total)];
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
