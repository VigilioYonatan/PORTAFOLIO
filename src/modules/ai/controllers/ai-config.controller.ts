import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import {
	AiConfigShowResponseClassDto,
	AiConfigUpdateResponseClassDto,
} from "../dtos/ai.response.class.dto";
import type {
	AiConfigShowResponseDto,
	AiConfigUpdateResponseDto,
} from "../dtos/ai.response.dto";
import { AiConfigUpdateClassDto } from "../dtos/ai-config.update.class.dto";
import {
	type AiConfigUpdateDto,
	aiConfigUpdateDto,
} from "../dtos/ai-config.update.dto";
import { AiConfigService } from "../services/ai-config.service";

@ApiTags("AI Config")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("ai-config")
export class AiConfigController {
	constructor(private readonly aiConfigService: AiConfigService) {}

	@Roles(1) // Admin
	@Get("/")
	@ApiOperation({ summary: "Get AI Configuration" })
	@ApiResponse({ status: 200, type: AiConfigShowResponseClassDto })
	show(@Req() req: Request): Promise<AiConfigShowResponseDto> {
		return this.aiConfigService.show(req.locals.tenant.id);
	}

	@Roles(1) // Admin
	@Put("/")
	@ApiOperation({ summary: "Update AI Configuration" })
	@ApiBody({ type: AiConfigUpdateClassDto })
	@ApiResponse({ status: 200, type: AiConfigUpdateResponseClassDto })
	update(
		@Req() req: Request,
		@Body(new ZodPipe(aiConfigUpdateDto)) body: AiConfigUpdateDto,
	): Promise<AiConfigUpdateResponseDto> {
		return this.aiConfigService.update(req.locals.tenant.id, body);
	}
}
