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
import { TenantQueryClassDto } from "../dtos/tenant.query.class.dto";
import { tenantQueryDto } from "../dtos/tenant.query.dto";
import {
	TenantDestroyResponseClassDto,
	TenantIndexResponseClassDto,
	TenantResponseClassDto,
	TenantShowResponseClassDto,
	TenantStoreResponseClassDto,
	TenantUpdateMeResponseClassDto,
	TenantUpdateResponseClassDto,
} from "../dtos/tenant.response.class.dto";
import { TenantStoreClassDto } from "../dtos/tenant.store.class.dto";
import { type TenantStoreDto, tenantStoreDto } from "../dtos/tenant.store.dto";
import { TenantUpdateClassDto } from "../dtos/tenant.update.class.dto";
import {
	type TenantUpdateDto,
	tenantUpdateDto,
} from "../dtos/tenant.update.dto";
import { TenantUpdateMeClassDto } from "../dtos/tenant.update-me.class.dto";
import {
	type TenantUpdateMeDto,
	tenantUpdateMeDto,
} from "../dtos/tenant.update-me.dto";
import { TenantService } from "../services/tenant.service";

// Assuming ResponseDto is a generic response type that needs to be imported or defined.
// For the purpose of this edit, I will add a placeholder import.
// If ResponseDto is meant to be one of the existing DTOs, please clarify.
// import { ResponseDto } from 'path/to/response.dto'; // Placeholder

@ApiTags("Tenants")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("tenants")
export class TenantController {
	constructor(private readonly tenantService: TenantService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "Listar tenants paginados" })
	@ApiResponse({
		status: 200,
		type: TenantIndexResponseClassDto,
		description: "Lista de tenants paginada",
	})
	index(
		@Query(new ZodQueryPipe(tenantQueryDto)) query: TenantQueryClassDto,
	): Promise<TenantIndexResponseClassDto> {
		// Changed from Promise<TenantIndexResponseClassDto> to Promise<ResponseDto>
		return this.tenantService.index(query);
	}

	@HttpCode(200)
	@Get("/me")
	@ApiOperation({ summary: "Obtener tenant del usuario logueado" })
	@ApiResponse({
		status: 200,
		type: TenantResponseClassDto,
		description: "Detalle del tenant propio",
	})
	showMe(@Req() req: Request): Promise<TenantResponseClassDto> {
		return this.tenantService.show(req.locals.tenant.id);
	}

	@Public()
	@Get("/:id")
	@ApiOperation({ summary: "Obtener tenant por ID" })
	@ApiResponse({
		status: 200,
		type: TenantShowResponseClassDto,
		description: "Detalle del tenant",
	})
	async show(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<TenantShowResponseClassDto> {
		return this.tenantService.show(id);
	}

	@Public()
	@HttpCode(201)
	@Post("/")
	@ApiOperation({ summary: "Crear nuevo tenant" })
	@ApiBody({ type: TenantStoreClassDto })
	@ApiResponse({
		status: 201,
		type: TenantStoreResponseClassDto,
		description: "Tenant creado exitosamente",
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(tenantStoreDto)) body: TenantStoreDto,
	): Promise<TenantStoreResponseClassDto> {
		return this.tenantService.store(body);
	}

	// Admin/Owner
	@Roles(1, 3)
	@HttpCode(200)
	@Put("/me")
	@ApiOperation({ summary: "Actualizar el tenant propio del usuario logueado" })
	@ApiBody({ type: TenantUpdateMeClassDto })
	@ApiResponse({
		status: 200,
		type: TenantUpdateMeResponseClassDto,
		description: "Tenant actualizado",
	})
	updateMe(
		@Req() req: Request,
		@Body(new ZodPipe(tenantUpdateMeDto)) body: TenantUpdateMeDto,
	): Promise<TenantUpdateMeResponseClassDto> {
		return this.tenantService.updateMe(req.locals.tenant.id, body);
	}

	@Roles(1) // Admin
	@HttpCode(200)
	@Put("/:id")
	@ApiOperation({ summary: "Actualizar tenant" })
	@ApiBody({ type: TenantUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: TenantUpdateResponseClassDto,
		description: "Tenant actualizado",
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(tenantUpdateDto)) body: TenantUpdateDto,
	): Promise<TenantUpdateResponseClassDto> {
		return this.tenantService.update(id, body);
	}

	@Roles(1) // Admin
	@Delete("/:id")
	@ApiOperation({ summary: "Eliminar tenant" })
	@ApiResponse({
		status: 200,
		type: TenantDestroyResponseClassDto,
		description: "Tenant eliminado",
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<TenantDestroyResponseClassDto> {
		// Changed from Promise<TenantDestroyResponseClassDto> to Promise<ResponseDto>
		return this.tenantService.destroy(id);
	}
}
