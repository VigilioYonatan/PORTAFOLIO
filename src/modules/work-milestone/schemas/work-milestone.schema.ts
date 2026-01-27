import { z } from "@infrastructure/config/zod-i18n.config";
import {
	customDateSchema,
	timeStampSchema,
} from "@infrastructure/schemas/time_stamp.schema";

export const workMilestoneSchema = z.object({
	id: z.number().int().positive(),
	title: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	icon: z.string().max(100).nullable().optional(),
	milestone_date: customDateSchema,
	sort_order: z.number().int(),
	work_experience_id: z.number().int().positive(),
	tenant_id: z.number().int().positive(),
	...timeStampSchema.shape,
});

export type WorkMilestoneSchema = z.infer<typeof workMilestoneSchema>;
