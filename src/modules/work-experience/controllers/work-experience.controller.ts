import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
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
import { WorkExperienceQueryClassDto } from "../dtos/work-experience.query.class.dto";
import {
	WorkExperienceDestroyResponseClassDto,
	WorkExperienceIndexResponseClassDto,
	WorkExperienceStoreResponseClassDto,
	WorkExperienceUpdateResponseClassDto,
} from "../dtos/work-experience.response.class.dto";
import type {
	WorkExperienceDestroyResponseDto,
	WorkExperienceIndexResponseDto,
	WorkExperienceStoreResponseDto,
	WorkExperienceUpdateResponseDto,
} from "../dtos/work-experience.response.dto";
import { WorkExperienceStoreClassDto } from "../dtos/work-experience.store.class.dto";
import {
	type WorkExperienceStoreDto,
	workExperienceStoreDto,
} from "../dtos/work-experience.store.dto";
import { WorkExperienceUpdateClassDto } from "../dtos/work-experience.update.class.dto";
import {
	type WorkExperienceUpdateDto,
	workExperienceUpdateDto,
} from "../dtos/work-experience.update.dto";
import { type WorkExperienceSchema } from "../schemas/work-experience.schema";
import { WorkExperienceService } from "../services/work-experience.service";

@ApiTags("Work Experience")
@UseGuards(AuthenticatedGuard)
@Controller("experiences")
export class WorkExperienceController {
	constructor(private readonly workExperienceService: WorkExperienceService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "Listar experiencias laborales" })
	@ApiResponse({
		status: 200,
		type: WorkExperienceIndexResponseClassDto,
		description: "Lista de experiencias laborales paginadas",
	})
	index(
		@Req() req: Request,
		@Query() query: WorkExperienceQueryClassDto,
	): Promise<WorkExperienceIndexResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.workExperienceService.index(tenant_id, query);
	}

	@HttpCode(201)
	@Post("/")
	@Roles(1) // Admin
	@ApiOperation({ summary: "Crear experiencia laboral" })
	@ApiResponse({
		status: 201,
		type: WorkExperienceStoreResponseClassDto,
		description: "Experiencia laboral creada exitosamente",
	})
	@ApiBody({ type: WorkExperienceStoreClassDto })
	store(
		@Req() req: Request,
		@Body(new ZodPipe(workExperienceStoreDto)) body: WorkExperienceStoreDto,
	): Promise<WorkExperienceStoreResponseDto> {
		return this.workExperienceService.store(req.locals.tenant.id, body);
	}

	@HttpCode(200)
	@Put("/:id")
	@Roles(1) // Admin
	@ApiOperation({ summary: "Actualizar experiencia laboral" })
	@ApiResponse({
		status: 200,
		type: WorkExperienceUpdateResponseClassDto,
		description: "Experiencia laboral actualizada exitosamente",
	})
	@ApiBody({ type: WorkExperienceUpdateClassDto })
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(workExperienceUpdateDto)) body: WorkExperienceUpdateDto,
	): Promise<WorkExperienceUpdateResponseDto> {
		return this.workExperienceService.update(req.locals.tenant.id, id, body);
	}

	@HttpCode(200)
	@Delete("/:id")
	@Roles(1) // Admin
	@ApiOperation({ summary: "Eliminar experiencia laboral" })
	@ApiResponse({
		status: 200,
		type: WorkExperienceDestroyResponseClassDto,
		description: "Experiencia laboral eliminada exitosamente",
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<WorkExperienceDestroyResponseDto> {
		return this.workExperienceService.destroy(req.locals.tenant.id, id);
	}
}
