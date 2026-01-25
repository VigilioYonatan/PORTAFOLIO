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
import type { UsageQuotaSchema } from "../schemas/usage-quota.schema";
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
		return this.usageService.getCurrentUsage(req.locals.tenant.id);
	}

	@Get("/history")
	@ApiOperation({ summary: "Get usage history" })
	@ApiResponse({ type: UsageHistoryResponseClassDto })
	async history(
		@Req() req: Request,
		@Query() query: UsageQuotaQueryDto,
	): Promise<UsageHistoryResponseDto> {
		return this.usageService.getHistory(req.locals.tenant.id, query);
	}
}
