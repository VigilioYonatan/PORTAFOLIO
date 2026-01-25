import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const technologySchema = z
	.object({
		id: z.number().int().positive(),
		name: z.string().min(1).max(100),
		category: z.enum([
			"FRONTEND",
			"BACKEND",
			"DATABASE",
			"DEVOPS",
			"LANGUAGE",
			"MOBILE",
			"AI",
		]),
		icon: z
			.array(filesSchema(UPLOAD_CONFIG.technology.icon?.dimensions))
			.optional(),
		tenant_id: z.number().int().positive(),
		...timeStampSchema.shape,
	})
	.strict();

export type TechnologySchema = z.infer<typeof technologySchema>;
