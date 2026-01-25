import { portfolioConfigUpdateDto } from "@modules/portfolio-config/dtos/portfolio-config.update.dto";
import { createZodDto } from "nestjs-zod";

/**
 * Swagger Class DTO for PUT /config body
 */
export class PortfolioConfigUpdateClassDto extends createZodDto(
	portfolioConfigUpdateDto,
) {}
