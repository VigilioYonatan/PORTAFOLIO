import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { aiInsightSchema } from "../schemas/ai-insight.schema";

// --- Index / List ---
export const aiInsightIndexResponseDto = createPaginatorSchema(aiInsightSchema);
export type AiInsightIndexResponseDto = z.infer<
	typeof aiInsightIndexResponseDto
>;

// --- Generate ---
export const aiInsightGenerateResponseDto = z.object({
	success: z.literal(true),
	insight: aiInsightSchema,
});
export type AiInsightGenerateResponseDto = z.infer<
	typeof aiInsightGenerateResponseDto
>;

// --- Generic ---
export const analyticsResponseDto = z.object({
	success: z.literal(true),
	insight: aiInsightSchema,
});
export type AnalyticsResponseDto = z.infer<typeof analyticsResponseDto>;
