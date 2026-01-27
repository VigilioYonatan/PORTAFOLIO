import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { DashboardResponseClassDto } from "../dtos/dashboard.response.class.dto";
import type { DashboardResponseDto } from "../dtos/dashboard.response.dto";
import { DashboardService } from "../services/dashboard.service";

@ApiTags("Analytics Dashboard")
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller("analytics")
export class DashboardController {
	constructor(private readonly service: DashboardService) {}

	@Get("/dashboard")
	@Roles(1)
	@ApiOperation({ summary: "Get dashboard metrics" })
	@ApiResponse({ status: 200, type: DashboardResponseClassDto })
	async getMetrics(@Req() req: Request): Promise<DashboardResponseDto> {
		return this.service.getMetrics(req.locals.tenant.id);
	}
}
