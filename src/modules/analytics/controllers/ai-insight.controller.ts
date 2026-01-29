import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import {
	Controller,
	Get,
	HttpCode,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { AiInsightQueryClassDto } from "../dtos/ai-insight.query.class.dto";
import { aiInsightQueryDto } from "../dtos/ai-insight.query.dto";
import { AiInsightIndexResponseClassDto } from "../dtos/analytics.response.class.dto";
import type { AiInsightIndexResponseDto } from "../dtos/analytics.response.dto";
import { AiInsightService } from "../services/ai-insight.service";

@ApiTags("IA Insight")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("ai-insight")
export class AiInsightController {
	constructor(private readonly service: AiInsightService) {}

	@Get("/")
	@Roles(1)
	@ApiOperation({ summary: "List AI insights for tenant" })
	@ApiResponse({ status: 200, type: AiInsightIndexResponseClassDto })
	async index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(aiInsightQueryDto)) query: AiInsightQueryClassDto,
	): Promise<AiInsightIndexResponseDto> {
		return this.service.index(req.locals.tenant.id, query);
	}

	@Roles(1)
	@Post("/generate")
	@HttpCode(201)
	@ApiOperation({ summary: "Generate new AI insight" })
	async generate(@Req() req: Request) {
		return this.service.generate(req.locals.tenant.id);
	}
}
