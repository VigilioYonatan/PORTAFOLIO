import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { TechnologyQueryClassDto } from "../dtos/technology.query.class.dto";
import { technologyQueryDto } from "../dtos/technology.query.dto";
import {
	TechnologyDestroyResponseClassDto,
	TechnologyIndexResponseClassDto,
	TechnologyShowResponseClassDto,
	TechnologyStoreResponseClassDto,
	TechnologyUpdateResponseClassDto,
} from "../dtos/technology.response.class.dto";
import {
	type TechnologyDestroyResponseDto,
	type TechnologyIndexResponseApi,
	type TechnologyShowResponseDto,
	type TechnologyStoreResponseDto,
	type TechnologyUpdateResponseDto,
} from "../dtos/technology.response.dto";
import { TechnologyStoreClassDto } from "../dtos/technology.store.class.dto";
import {
	type TechnologyStoreDto,
	technologyStoreDto,
} from "../dtos/technology.store.dto";
import { TechnologyUpdateClassDto } from "../dtos/technology.update.class.dto";
import {
	type TechnologyUpdateDto,
	technologyUpdateDto,
} from "../dtos/technology.update.dto";
import { TechnologyService } from "../services/technology.service";

@ApiTags("Tecnologías")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("technology")
export class TechnologyController {
	constructor(private readonly technologyService: TechnologyService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "List technologies" })
	@ApiResponse({
		status: 200,
		type: TechnologyIndexResponseClassDto,
	})
	index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(technologyQueryDto)) query: TechnologyQueryClassDto,
	): Promise<TechnologyIndexResponseApi> {
		return this.technologyService.index(req.locals.tenant.id, query);
	}

	@Get("/:id")
	@ApiOperation({ summary: "Show technology" })
	@ApiResponse({
		status: 200,
		type: TechnologyShowResponseClassDto,
	})
	show(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<TechnologyShowResponseDto> {
		return this.technologyService.show(req.locals.tenant.id, id);
	}

	@HttpCode(201)
	@Roles(1) // Admin only
	@Post("/")
	@ApiOperation({ summary: "Create technology" })
	@ApiBody({ type: TechnologyStoreClassDto })
	@ApiResponse({
		status: 201,
		type: TechnologyStoreResponseClassDto,
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(technologyStoreDto)) body: TechnologyStoreDto,
	): Promise<TechnologyStoreResponseDto> {
		return this.technologyService.store(req.locals.tenant.id, body);
	}

	@Roles(1) // Admin only
	@Patch("/:id")
	@ApiOperation({ summary: "Update technology" })
	@ApiBody({ type: TechnologyUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: TechnologyUpdateResponseClassDto,
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(technologyUpdateDto)) body: TechnologyUpdateDto,
	): Promise<TechnologyUpdateResponseDto> {
		return this.technologyService.update(req.locals.tenant.id, id, body);
	}

	@Roles(1) // Admin only
	@Delete("/:id")
	@ApiOperation({ summary: "Delete technology" })
	@ApiResponse({
		status: 200,
		type: TechnologyDestroyResponseClassDto,
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<TechnologyDestroyResponseDto> {
		return this.technologyService.destroy(req.locals.tenant.id, id);
	}
}
