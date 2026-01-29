import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const TECHEABLE_TYPES = ["PORTFOLIO_PROJECT", "BLOG_POST"] as const;

export const techeableSchema = z.object({
	id: z.number().int().positive(),
	techeable_id: z.number().int().positive(),
	techeable_type: z.enum(TECHEABLE_TYPES),
	technology_id: z.number().int().positive(),
	tenant_id: z.number().int().positive(),
	...timeStampSchema.shape,
});

export type TecheableSchema = z.infer<typeof techeableSchema>;
