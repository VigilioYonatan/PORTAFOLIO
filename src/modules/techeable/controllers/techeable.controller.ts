import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import {
	Body,
	Controller,
	Delete,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { type Request } from "express";
import {
	TecheableDestroyResponseClassDto,
	TecheableStoreResponseClassDto,
} from "../dtos/techeable.response.class.dto";
import type {
	TecheableDestroyResponseDto,
	TecheableStoreResponseDto,
} from "../dtos/techeable.response.dto";
import { TecheableStoreClassDto } from "../dtos/techeable.store.class.dto";
import {
	type TecheableStoreDto,
	techeableStoreDto,
} from "../dtos/techeable.store.dto";
import { TecheableService } from "../services/techeable.service";

@ApiTags("Techeables")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("techeables")
export class TecheableController {
	constructor(private readonly techeableService: TecheableService) {}

	@Roles(1, 2) // Admin
	@Post("/")
	@HttpCode(201)
	@ApiOperation({ summary: "Create techeable link" })
	@ApiBody({ type: TecheableStoreClassDto })
	@ApiResponse({ status: 201, type: TecheableStoreResponseClassDto })
	store(
		@Req() req: Request,
		@Body(new ZodPipe(techeableStoreDto)) body: TecheableStoreDto,
	): Promise<TecheableStoreResponseDto> {
		return this.techeableService.store(req.locals.tenant.id, body);
	}

	@Roles(1, 2)
	@Delete("/:id")
	@ApiOperation({ summary: "Delete techeable link" })
	@ApiResponse({ status: 200, type: TecheableDestroyResponseClassDto })
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<TecheableDestroyResponseDto> {
		return this.techeableService.destroy(req.locals.tenant.id, id);
	}
}
