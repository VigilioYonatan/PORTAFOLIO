import { z } from "@infrastructure/config/zod-i18n.config";
import {
	customDateSchema,
	timeStampSchema,
} from "@infrastructure/schemas/time_stamp.schema";
import { LANGUAGES } from "@infrastructure/types/i18n";

export const workExperienceSchema = z.object({
	id: z.number().int().positive(),
	company: z.string().min(1).max(100),
	position: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	content: z.string().nullable(),
	location: z.string().max(100).nullable(),
	sort_order: z.number().int(),
	is_current: z.boolean(),
	is_visible: z.boolean(),
	start_date: customDateSchema,
	end_date: customDateSchema.nullable(),
	tenant_id: z.number().int().positive(),
	language: z.enum(LANGUAGES),
	parent_id: z.number().int().positive().nullable(),
	...timeStampSchema.shape,
});

export type WorkExperienceSchema = z.infer<typeof workExperienceSchema>;
