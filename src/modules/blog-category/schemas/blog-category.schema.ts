import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const blogCategorySchema = z
	.object({
		id: z.number().int().positive(),
		name: z.string().min(1).max(100),
		slug: z.string().min(1).max(100),
		description: z.string().nullable(),
		tenant_id: z.number().int().positive(),
		...timeStampSchema.shape,
	})
	.strict();

export type BlogCategorySchema = z.infer<typeof blogCategorySchema>;
