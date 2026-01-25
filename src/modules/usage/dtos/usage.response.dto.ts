import { z } from "@infrastructure/config/zod-i18n.config";
import { usageQuotaSchema } from "../schemas/usage-quota.schema";

/**
 * Response DTO for current month usage
 */
export const usageIndexResponseDto = z.object({
	success: z.literal(true),
	usage: usageQuotaSchema,
});
export type UsageIndexResponseDto = z.infer<typeof usageIndexResponseDto>;

/**
 * Response DTO for usage history
 */
export const usageHistoryResponseDto = z.object({
	success: z.literal(true),
	history: z.array(usageQuotaSchema),
});
export type UsageHistoryResponseDto = z.infer<typeof usageHistoryResponseDto>;

// --- Generic ---
export const usageResponseDto = z.object({
	success: z.literal(true),
	usage: usageQuotaSchema,
});
export type UsageResponseDto = z.infer<typeof usageResponseDto>;
