import { createZodDto } from "nestjs-zod";
import {
	portfolioConfigShowResponseDto,
	portfolioConfigUpdateResponseDto,
} from "./portfolio-config.response.dto";

export class PortfolioConfigShowResponseClassDto extends createZodDto(
	portfolioConfigShowResponseDto,
) {}
export class PortfolioConfigUpdateResponseClassDto extends createZodDto(
	portfolioConfigUpdateResponseDto,
) {}
