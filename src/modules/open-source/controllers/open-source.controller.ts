import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
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
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { OpenSourceQueryClassDto } from "../dtos/open-source.query.class.dto";
import type {
	OpenSourceDestroyResponseDto,
	OpenSourceIndexResponseDto,
	OpenSourceShowResponseDto,
	OpenSourceStoreResponseDto,
	OpenSourceUpdateResponseDto,
} from "../dtos/open-source.response.dto";
import { OpenSourceStoreClassDto } from "../dtos/open-source.store.class.dto";
import { openSourceStoreDto } from "../dtos/open-source.store.dto";
import { OpenSourceUpdateClassDto } from "../dtos/open-source.update.class.dto";
import { openSourceUpdateDto } from "../dtos/open-source.update.dto";
import { OpenSourceService } from "../services/open-source.service";

@ApiTags("Open Source")
@Controller("opensource")
export class OpenSourceController {
	constructor(private readonly openSourceService: OpenSourceService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "List open source projects" })
	index(
		@Req() req: Request,
		@Query() query: OpenSourceQueryClassDto,
	): Promise<OpenSourceIndexResponseDto> {
		return this.openSourceService.index(req.locals.tenant.id, query);
	}

	@Public()
	@Get("/:id")
	@ApiOperation({ summary: "Show an open source project" })
	show(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<OpenSourceShowResponseDto> {
		return this.openSourceService.show(req.locals.tenant.id, id);
	}

	@Public()
	@Get("/slug/:slug")
	@ApiOperation({ summary: "Show an open source project by slug" })
	showBySlug(
		@Req() req: Request,
		@Param("slug") slug: string,
	): Promise<OpenSourceShowResponseDto> {
		return this.openSourceService.showBySlug(req.locals.tenant.id, slug);
	}

	@UseGuards(AuthenticatedGuard)
	@Post("/")
	@ApiOperation({ summary: "Create an open source project" })
	@ApiBody({ type: OpenSourceStoreClassDto })
	store(
		@Req() req: Request,
		@Body(new ZodPipe(openSourceStoreDto)) body: OpenSourceStoreClassDto,
	): Promise<OpenSourceStoreResponseDto> {
		return this.openSourceService.store(req.locals.tenant.id, body);
	}

	@UseGuards(AuthenticatedGuard)
	@Put("/:id")
	@ApiOperation({ summary: "Update an open source project" })
	@ApiBody({ type: OpenSourceUpdateClassDto })
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(openSourceUpdateDto)) body: OpenSourceUpdateClassDto,
	): Promise<OpenSourceUpdateResponseDto> {
		return this.openSourceService.update(req.locals.tenant.id, id, body);
	}

	@UseGuards(AuthenticatedGuard)
	@Delete("/:id")
	@ApiOperation({ summary: "Delete an open source project" })
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<OpenSourceDestroyResponseDto> {
		return this.openSourceService.destroy(req.locals.tenant.id, id);
	}
}
