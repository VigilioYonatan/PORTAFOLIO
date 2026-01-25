import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const usageQuotaSchema = z.object({
	id: z.number().int().positive(),
	year: z.number().int().min(2025), // Assuming project start or reasonable min year
	month: z.number().int().min(1).max(12),
	documents_count: z.number().int().min(0),
	messages_count: z.number().int().min(0),
	tokens_count: z.number().int().min(0),
	storage_bytes: z.number().int().min(0), // Using number for JS/TS representation of bigint if safe, or coerce
	tenant_id: z.number().int().positive(),
	...timeStampSchema.shape,
});

export type UsageQuotaSchema = z.infer<typeof usageQuotaSchema>;
