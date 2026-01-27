import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { usageQuotaQueryDto } from "../dtos/usage-quota.query.dto";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import {
	UsageHistoryResponseClassDto,
	UsageIndexResponseClassDto,
} from "../dtos/usage.response.class.dto";
import type {
	UsageHistoryResponseDto,
	UsageIndexResponseDto,
} from "../dtos/usage.response.dto";
import { UsageQuotaQueryDto } from "../dtos/usage-quota.query.dto";
import { UsageService } from "../services/usage.service";

@ApiTags("Usage")
@UseGuards(AuthenticatedGuard)
@Controller("usage")
export class UsageController {
	constructor(private readonly usageService: UsageService) {}

	@Get("/")
	@ApiOperation({ summary: "Get current month usage" })
	@ApiResponse({ type: UsageIndexResponseClassDto })
	async index(@Req() req: Request): Promise<UsageIndexResponseDto> {
		return this.usageService.index(req.locals.tenant.id);
	}

	@Get("/history")
	@ApiOperation({ summary: "Get usage history" })
	@ApiResponse({ type: UsageHistoryResponseClassDto })
	async history(
		@Req() req: Request,
		@Query(new ZodQueryPipe(usageQuotaQueryDto)) query: UsageQuotaQueryDto,
	): Promise<UsageHistoryResponseDto> {
		return this.usageService.history(req.locals.tenant.id, query);
	}
}
