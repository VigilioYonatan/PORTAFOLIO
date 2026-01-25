import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { AiInsightQueryClassDto } from "../dtos/ai-insight.query.class.dto";
import {
	AiInsightGenerateResponseClassDto,
	AiInsightIndexResponseClassDto,
} from "../dtos/analytics.response.class.dto";
import type {
	AiInsightGenerateResponseDto,
	AiInsightIndexResponseDto,
} from "../dtos/analytics.response.dto";
import type { AiInsightSchema } from "../schemas/ai-insight.schema";
import { AiInsightService } from "../services/ai-insight.service";

@ApiTags("Analytics / AI Insights")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("analytics/insights")
export class AiInsightController {
	constructor(private readonly service: AiInsightService) {}

	@Roles(1) // Admin
	@Post("/generate")
	@ApiOperation({ summary: "Generate new AI insights (Batch)" })
	@ApiResponse({ status: 201, type: AiInsightGenerateResponseClassDto })
	generate(@Req() req: Request): Promise<AiInsightGenerateResponseDto> {
		return this.service.generate(req.locals.tenant.id);
	}

	@Roles(1) // Admin
	@Get("/")
	@ApiOperation({ summary: "List AI insights" })
	@ApiResponse({ status: 200, type: AiInsightIndexResponseClassDto })
	index(
		@Req() req: Request,
		@Query() query: AiInsightQueryClassDto,
	): Promise<AiInsightIndexResponseDto> {
		return this.service.index(req.locals.tenant.id, query);
	}
}
