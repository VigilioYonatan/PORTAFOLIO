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
import { MusicQueryClassDto } from "../dtos/music.class.dto";
import { musicQueryDto } from "../dtos/music.query.dto";
import {
	MusicTrackDestroyResponseClassDto,
	MusicTrackIndexResponseClassDto,
	MusicTrackStoreResponseClassDto,
	MusicTrackUpdateResponseClassDto,
} from "../dtos/music.response.class.dto";
import type {
	MusicTrackDestroyResponseDto,
	MusicTrackIndexResponseDto,
	MusicTrackStoreResponseDto,
	MusicTrackUpdateResponseDto,
} from "../dtos/music.response.dto";
import { type MusicStoreDto, musicStoreDto } from "../dtos/music.store.dto";
import { type MusicUpdateDto, musicUpdateDto } from "../dtos/music.update.dto";
import { MusicService } from "../services/music.service";

@ApiTags("Música")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("music")
export class MusicController {
	constructor(private readonly musicService: MusicService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "Listar pistas de música (paginado)" })
	@ApiResponse({
		status: 200,
		type: MusicTrackIndexResponseClassDto,
		description: "Lista de pistas recuperada con éxito",
	})
	index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(musicQueryDto)) query: MusicQueryClassDto,
	): Promise<MusicTrackIndexResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.musicService.index(tenant_id, query);
	}

	@HttpCode(201)
	@Post("/")
	@Roles(1)
	@ApiOperation({ summary: "Subir nueva pista de música" })
	@ApiBody({ type: MusicTrackStoreResponseClassDto }) // Should be Store DTO Class not Response Class for ApiBody
	@ApiResponse({
		status: 201,
		type: MusicTrackStoreResponseClassDto,
		description: "Pista creada exitosamente",
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(musicStoreDto)) body: MusicStoreDto,
	): Promise<MusicTrackStoreResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.musicService.store(tenant_id, body);
	}

	@HttpCode(200)
	@Put("/:id")
	@Roles(1)
	@ApiOperation({ summary: "Actualizar información de la pista" })
	@ApiBody({ type: MusicTrackUpdateResponseClassDto }) // Should be Update DTO Class
	@ApiResponse({
		status: 200,
		type: MusicTrackUpdateResponseClassDto,
		description: "Información actualizada",
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(musicUpdateDto)) body: MusicUpdateDto,
	): Promise<MusicTrackUpdateResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.musicService.update(tenant_id, id, body);
	}

	@HttpCode(200)
	@Delete("/:id")
	@Roles(1)
	@ApiOperation({ summary: "Eliminar pista de música" })
	@ApiResponse({
		status: 200,
		type: MusicTrackDestroyResponseClassDto,
		description: "Pista eliminada exitosamente",
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<MusicTrackDestroyResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.musicService.destroy(tenant_id, id);
	}
}
