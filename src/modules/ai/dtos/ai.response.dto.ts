import { z } from "@infrastructure/config/zod-i18n.config";
import { aiConfigSchema } from "../schemas/ai-config.schema";

/**
 * Response DTO for GET /ai-config
 */
export const aiConfigShowResponseDto = z
	.object({
		success: z.literal(true),
		config: aiConfigSchema.nullable(),
	})
	.strict();
export type AiConfigShowResponseDto = z.infer<typeof aiConfigShowResponseDto>;

/**
 * Response DTO for PUT /ai-config
 */
export const aiConfigUpdateResponseDto = z
	.object({
		success: z.literal(true),
		config: aiConfigSchema,
	})
	.strict();
export type AiConfigUpdateResponseDto = z.infer<
	typeof aiConfigUpdateResponseDto
>;

// --- Generic ---
export const aiConfigResponseDto = z.object({
	success: z.literal(true),
	config: aiConfigSchema,
});
export type AiConfigResponseDto = z.infer<typeof aiConfigResponseDto>;
