import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import {
	type BlogPostQueryDto,
	blogPostQueryDto,
} from "../dtos/blog-post.query.dto";
import type {
	BlogPostDestroyResponseDto,
	BlogPostIndexResponseDto,
	BlogPostShowResponseDto,
	BlogPostStoreResponseDto,
	BlogPostUpdateResponseDto,
} from "../dtos/blog-post.response.dto";
import {
	type BlogPostStoreDto,
	blogPostStoreDto,
} from "../dtos/blog-post.store.dto";
import {
	type BlogPostUpdateDto,
	blogPostUpdateDto,
} from "../dtos/blog-post.update.dto";
import { BlogPostService } from "../services/blog-post.service";

@ApiTags("Blog Post")
@Controller("blog-post")
export class BlogPostController {
	constructor(private readonly service: BlogPostService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "List blog posts (Public)" })
	async index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(blogPostQueryDto)) query: BlogPostQueryDto,
	): Promise<BlogPostIndexResponseDto> {
		const result = await this.service.index(req.locals.tenant.id, query);
		return result;
	}

	@Public()
	@Get(":slug")
	@ApiOperation({ summary: "Get blog post by slug (Public)" })
	@ApiParam({ name: "slug", description: "Post slug" })
	async show(
		@Req() req: Request,
		@Param("slug") slug: string,
	): Promise<BlogPostShowResponseDto> {
		const result = await this.service.showBySlug(req.locals.tenant.id, slug);
		return result;
	}

	// NOTE: Admin endpoints use ID, public endpoints use Slug usually.
	// However, for management, we might want showById as well.
	// Adding showById for Admin usage? The requirement was 9.2 Ver detalle de post (Publico, por slug).
	// I already covered public showBySlug.
	// Let's add standard CRUD strictly.

	@Roles(1)
	@ApiBearerAuth()
	@Post()
	@ApiOperation({ summary: "Create blog post (Admin)" })
	async store(
		@Req() req: Request,
		@Body(new ZodPipe(blogPostStoreDto)) body: BlogPostStoreDto,
	): Promise<BlogPostStoreResponseDto> {
		return this.service.store(
			req.locals.tenant.id,
			req.locals.user!.id, // Author ID from authenticated user
			body,
		);
	}

	@Roles(1)
	@ApiBearerAuth()
	@Put(":id")
	@ApiOperation({ summary: "Update blog post (Admin)" })
	async update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(blogPostUpdateDto)) body: BlogPostUpdateDto,
	): Promise<BlogPostUpdateResponseDto> {
		return this.service.update(req.locals.tenant.id, id, body);
	}

	@Roles(1)
	@ApiBearerAuth()
	@Delete(":id")
	@ApiOperation({ summary: "Delete blog post (Admin)" })
	async destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<BlogPostDestroyResponseDto> {
		return this.service.destroy(req.locals.tenant.id, id);
	}
}
