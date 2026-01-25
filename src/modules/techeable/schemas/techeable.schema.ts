import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const techeableSchema = z
	.object({
		id: z.number().int().positive(),
		techeable_id: z.number().int().positive(),
		techeable_type: z.enum(["PORTFOLIO_PROJECT", "BLOG_POST"]),
		technology_id: z.number().int().positive(),
		tenant_id: z.number().int().positive(),
		...timeStampSchema.shape,
	})
	.strict();

export type TecheableSchema = z.infer<typeof techeableSchema>;
