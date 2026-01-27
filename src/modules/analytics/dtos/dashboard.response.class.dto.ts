import { createZodDto } from "nestjs-zod";
import { dashboardResponseDto } from "./dashboard.response.dto";

export class DashboardResponseClassDto extends createZodDto(
	dashboardResponseDto,
) {}
