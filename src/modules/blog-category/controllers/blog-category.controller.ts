import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
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
	UsePipes,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import { BlogCategoryQueryClassDto } from "../dtos/blog-category.query.class.dto";
import {
	BlogCategoryDestroyResponseClassDto,
	BlogCategoryIndexResponseClassDto,
	BlogCategoryShowResponseClassDto,
	BlogCategoryStoreResponseClassDto,
	BlogCategoryUpdateResponseClassDto,
} from "../dtos/blog-category.response.class.dto";
import { BlogCategoryStoreClassDto } from "../dtos/blog-category.store.class.dto";
import {
	type BlogCategoryStoreDto,
	blogCategoryStoreSchema,
} from "../dtos/blog-category.store.dto";
import { BlogCategoryUpdateClassDto } from "../dtos/blog-category.update.class.dto";
import {
	type BlogCategoryUpdateDto,
	blogCategoryUpdateSchema,
} from "../dtos/blog-category.update.dto";
import { BlogCategoryService } from "../services/blog-category.service";

@ApiTags("Blog Categories")
@Controller("blog/categories")
export class BlogCategoryController {
	constructor(private readonly service: BlogCategoryService) {}

	@Get()
	@Public()
	@ApiOperation({ summary: "List blog categories" })
	@ApiResponse({ status: 200, description: "List of blog categories" })
	async index(
		@Req() req: Request,
		@Query() query: BlogCategoryQueryClassDto,
	): Promise<BlogCategoryIndexResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.service.index(tenant_id, query);
	}

	@Get(":id")
	@Public()
	@ApiOperation({ summary: "Get blog category details" })
	@ApiResponse({ status: 200, description: "Blog category details" })
	async show(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<BlogCategoryShowResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.service.show(tenant_id, id);
	}

	@Post()
	@ApiBearerAuth()
	@Roles(1) // Admin only
	@ApiOperation({ summary: "Create blog category" })
	@ApiResponse({ status: 201, description: "Blog category created" })
	async store(
		@Req() req: Request,
		@Body(new ZodPipe(blogCategoryStoreSchema)) body: BlogCategoryStoreDto,
	): Promise<BlogCategoryStoreResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.service.store(tenant_id, body);
	}

	@Put(":id")
	@ApiBearerAuth()
	@Roles(1) // Admin only
	@ApiOperation({ summary: "Update blog category" })
	@ApiResponse({ status: 200, description: "Blog category updated" })
	async update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(blogCategoryUpdateSchema)) body: BlogCategoryUpdateDto,
	): Promise<BlogCategoryUpdateResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.service.update(tenant_id, id, body);
	}

	@Delete(":id")
	@ApiBearerAuth()
	@Roles(1) // Admin only
	@ApiOperation({ summary: "Delete blog category" })
	@ApiResponse({ status: 200, description: "Blog category deleted" })
	async destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<BlogCategoryDestroyResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.service.destroy(tenant_id, id);
	}
}
