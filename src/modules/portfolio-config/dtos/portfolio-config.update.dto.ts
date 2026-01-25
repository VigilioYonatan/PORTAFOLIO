import { z } from "@infrastructure/config/zod-i18n.config";
import { portfolioConfigSchema } from "@modules/portfolio-config/schemas/portfolio-config.schema";

/**
 * Update DTO for PUT /config
 * Referencia: rules-endpoints.md #1.2
 * Body: Omit<PortfolioConfig, "id" | "created_at" | "updated_at">
 */
export const portfolioConfigUpdateDto = portfolioConfigSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type PortfolioConfigUpdateDto = z.infer<typeof portfolioConfigUpdateDto>;
