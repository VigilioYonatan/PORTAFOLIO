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
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { WorkMilestoneQueryClassDto } from "../dtos/work-milestone.query.class.dto";
import { workMilestoneQueryDto } from "../dtos/work-milestone.query.dto";
import {
	WorkMilestoneDestroyResponseClassDto,
	WorkMilestoneIndexResponseClassDto,
	WorkMilestoneStoreResponseClassDto,
	WorkMilestoneUpdateResponseClassDto,
} from "../dtos/work-milestone.response.class.dto";
import type {
	WorkMilestoneDestroyResponseDto,
	WorkMilestoneIndexResponseDto,
	WorkMilestoneStoreResponseDto,
	WorkMilestoneUpdateResponseDto,
} from "../dtos/work-milestone.response.dto";
import { WorkMilestoneStoreClassDto } from "../dtos/work-milestone.store.class.dto";
import {
	type WorkMilestoneStoreDto,
	workMilestoneStoreDto,
} from "../dtos/work-milestone.store.dto";
import { WorkMilestoneUpdateClassDto } from "../dtos/work-milestone.update.class.dto";
import {
	type WorkMilestoneUpdateDto,
	workMilestoneUpdateDto,
} from "../dtos/work-milestone.update.dto";
import { WorkMilestoneService } from "../services/work-milestone.service";

@ApiTags("Work Milestones")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("work-milestone")
export class WorkMilestoneController {
	constructor(private readonly workMilestoneService: WorkMilestoneService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "List milestones by experience" })
	@ApiResponse({
		status: 200,
		type: WorkMilestoneIndexResponseClassDto,
	})
	async index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(workMilestoneQueryDto))
		query: WorkMilestoneQueryClassDto,
	): Promise<WorkMilestoneIndexResponseDto> {
		return this.workMilestoneService.index(req.locals.tenant.id, query);
	}

	@Roles(1) // Admin
	@HttpCode(201)
	@Post("/")
	@ApiOperation({ summary: "Create milestone" })
	@ApiBody({ type: WorkMilestoneStoreClassDto })
	@ApiResponse({
		status: 201,
		type: WorkMilestoneStoreResponseClassDto,
	})
	async store(
		@Req() req: Request,
		@Body(new ZodPipe(workMilestoneStoreDto)) body: WorkMilestoneStoreDto,
	): Promise<WorkMilestoneStoreResponseDto> {
		return this.workMilestoneService.store(req.locals.tenant.id, body);
	}

	@Roles(1) // Admin
	@Put("/:id")
	@ApiOperation({ summary: "Update milestone" })
	@ApiBody({ type: WorkMilestoneUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: WorkMilestoneUpdateResponseClassDto,
	})
	async update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(workMilestoneUpdateDto)) body: WorkMilestoneUpdateDto,
	): Promise<WorkMilestoneUpdateResponseDto> {
		return this.workMilestoneService.update(req.locals.tenant.id, id, body);
	}

	@Roles(1) // Admin
	@Delete("/:id")
	@ApiOperation({ summary: "Delete milestone" })
	@ApiResponse({
		status: 200,
		type: WorkMilestoneDestroyResponseClassDto,
	})
	async destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<WorkMilestoneDestroyResponseDto> {
		return this.workMilestoneService.destroy(req.locals.tenant.id, id);
	}
}
