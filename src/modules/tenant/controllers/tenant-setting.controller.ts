import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Put,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { TenantSettingResponseClassDto } from "../dtos/tenant.response.class.dto";
import { TenantSettingUpdateClassDto } from "../dtos/tenant-setting.update.class.dto";
import {
	type TenantSettingUpdateDto,
	tenantSettingUpdateDto,
} from "../dtos/tenant-setting.update.dto";
import { TenantSettingUpdateMeClassDto } from "../dtos/tenant-setting.update-me.class.dto";
import {
	type TenantSettingUpdateMeDto,
	tenantSettingUpdateMeDto,
} from "../dtos/tenant-setting.update-me.dto";
import { TenantService } from "../services/tenant.service";

@ApiTags("Tenant Settings")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("tenants")
export class TenantSettingController {
	constructor(private readonly tenantService: TenantService) {}

	@Roles(1, 3) // Admin, Owner
	@Get("settings/me")
	@ApiOperation({ summary: "Leer configuración propia" })
	@ApiResponse({
		status: 200,
		type: TenantSettingResponseClassDto,
		description: "Configuración del tenant propio",
	})
	showMe(@Req() req: Request): Promise<TenantSettingResponseClassDto> {
		return this.tenantService.showSettings(req.locals.tenant.id);
	}

	@Roles(1, 3) // Admin, Owner
	@HttpCode(200)
	@Put("settings/me")
	@ApiOperation({ summary: "Actualizar configuración propia" })
	@ApiBody({ type: TenantSettingUpdateMeClassDto })
	@ApiResponse({
		status: 200,
		type: TenantSettingResponseClassDto,
		description: "Configuración actualizada",
	})
	updateMe(
		@Req() req: Request,
		@Body(new ZodPipe(tenantSettingUpdateMeDto)) body: TenantSettingUpdateMeDto,
	): Promise<TenantSettingResponseClassDto> {
		return this.tenantService.updateSettingMe(req.locals.tenant.id, body);
	}

	@Roles(1) // Admin
	@Get(":id/settings")
	@ApiOperation({ summary: "Leer configuración de un tenant" })
	@ApiResponse({
		status: 200,
		type: TenantSettingResponseClassDto,
		description: "Configuración del tenant",
	})
	show(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<TenantSettingResponseClassDto> {
		return this.tenantService.showSettings(id);
	}

	@Roles(1) // Admin
	@HttpCode(200)
	@Put(":id/settings")
	@ApiOperation({ summary: "Actualizar configuración de un tenant" })
	@ApiBody({ type: TenantSettingUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: TenantSettingResponseClassDto,
		description: "Configuración actualizada",
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(tenantSettingUpdateDto)) body: TenantSettingUpdateDto,
	): Promise<TenantSettingResponseClassDto> {
		return this.tenantService.updateSetting(id, body);
	}
}
