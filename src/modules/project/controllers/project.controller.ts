import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import type { PaginatorResult } from "@infrastructure/utils/server";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ProjectQueryClassDto } from "../dtos/project.query.class.dto";
import {
	ProjectDestroyResponseClassDto,
	ProjectIndexResponseClassDto,
	ProjectShowResponseClassDto,
	ProjectStoreResponseClassDto,
	ProjectSyncResponseClassDto,
	ProjectUpdateResponseClassDto,
} from "../dtos/project.response.class.dto";
import type { ProjectIndexResponseDto } from "../dtos/project.response.dto";
import { ProjectStoreClassDto } from "../dtos/project.store.class.dto";
import {
	type ProjectStoreDto,
	projectStoreDto,
} from "../dtos/project.store.dto";
import { ProjectUpdateClassDto } from "../dtos/project.update.class.dto";
import {
	type ProjectUpdateDto,
	projectUpdateDto,
} from "../dtos/project.update.dto";
import type { ProjectSchema } from "../schemas/project.schema";
import { ProjectService } from "../services/project.service";

@ApiTags("Proyectos")
@UseGuards(AuthenticatedGuard)
@Controller("projects")
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "Listar proyectos (paginado)" })
	@ApiResponse({
		status: 200,
		type: ProjectIndexResponseClassDto,
		description: "Lista de proyectos recuperada con éxito",
	})
	index(
		@Req() req: Request,
		@Query() query: ProjectQueryClassDto,
	): Promise<ProjectIndexResponseDto> {
		return this.projectService.index(req.locals.tenant.id, query);
	}

	@Public()
	@Get("/:slug")
	@ApiOperation({ summary: "Obtener detalle de proyecto por slug" })
	@ApiResponse({
		status: 200,
		type: ProjectShowResponseClassDto,
		description: "Detalle del proyecto",
	})
	showBySlug(
		@Req() req: Request,
		@Param("slug") slug: string,
	): Promise<ProjectShowResponseClassDto> {
		return this.projectService.showBySlug((req as any).locals.tenant.id, slug);
	}

	@HttpCode(201)
	@Post("/")
	@Roles(1)
	@ApiOperation({ summary: "Crear nuevo proyecto" })
	@ApiBody({ type: ProjectStoreClassDto })
	@ApiResponse({
		status: 201,
		type: ProjectStoreResponseClassDto,
		description: "Proyecto creado exitosamente",
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(projectStoreDto)) body: ProjectStoreDto,
	): Promise<ProjectStoreResponseClassDto> {
		return this.projectService.store((req as any).locals.tenant.id, body);
	}

	@HttpCode(200)
	@Put("/:id")
	@Roles(1)
	@ApiOperation({ summary: "Actualizar proyecto" })
	@ApiBody({ type: ProjectUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: ProjectUpdateResponseClassDto,
		description: "Proyecto actualizado exitosamente",
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(projectUpdateDto)) body: ProjectUpdateDto,
	): Promise<ProjectUpdateResponseClassDto> {
		return this.projectService.update((req as any).locals.tenant.id, id, body);
	}

	@HttpCode(200)
	@Delete("/:id")
	@Roles(1)
	@ApiOperation({ summary: "Eliminar proyecto" })
	@ApiResponse({
		status: 200,
		type: ProjectDestroyResponseClassDto,
		description: "Proyecto eliminado exitosamente",
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<ProjectDestroyResponseClassDto> {
		return this.projectService.destroy((req as any).locals.tenant.id, id);
	}

	@HttpCode(200)
	@Post("/:id/sync")
	@Roles(1)
	@ApiOperation({ summary: "Sincronizar con GitHub" })
	@ApiResponse({
		status: 200,
		type: ProjectSyncResponseClassDto,
		description: "Proyecto sincronizado exitosamente con GitHub",
	})
	sync(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<ProjectSyncResponseClassDto> {
		return this.projectService.sync((req as any).locals.tenant.id, id);
	}
}
