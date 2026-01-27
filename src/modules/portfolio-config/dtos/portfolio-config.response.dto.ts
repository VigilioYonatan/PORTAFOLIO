import { z } from "@infrastructure/config/zod-i18n.config";
import { portfolioConfigSchema } from "@modules/portfolio-config/schemas/portfolio-config.schema";

/**
 * Response DTO for GET /config
 * Returns the full portfolio configuration
 */
export const portfolioConfigShowResponseDto = z
	.object({
		success: z.literal(true),
		config: portfolioConfigSchema,
	})
	.strict();

export type PortfolioConfigShowResponseDto = z.infer<
	typeof portfolioConfigShowResponseDto
>;

/**
 * Response DTO for PUT /config
 * Returns the updated portfolio configuration
 */
export const portfolioConfigUpdateResponseDto = z
	.object({
		success: z.literal(true),
		config: portfolioConfigSchema,
	})
	.strict();

export type PortfolioConfigUpdateResponseDto = z.infer<
	typeof portfolioConfigUpdateResponseDto
>;

/**
 * Response DTO for GET /config/cv/download
 * Returns binary PDF data metadata
 */
export const portfolioConfigCvResponseDto = z
	.object({
		success: z.literal(true),
		contentType: z.enum(["application/pdf", "text/plain; charset=utf-8"]),
		filename: z.string(),
	})
	.strict();

export type PortfolioConfigCvResponseDto = z.infer<
	typeof portfolioConfigCvResponseDto
>;

/**
 * Internal Result DTO for Service -> Controller communication for file download
 */
export const portfolioConfigCvResultDto = z.object({
	buffer: z.any(), // Buffer
	filename: z.string(),
	contentType: z.string(),
});
export type PortfolioConfigCvResultDto = z.infer<
	typeof portfolioConfigCvResultDto
>;
