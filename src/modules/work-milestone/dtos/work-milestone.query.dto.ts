import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { workMilestoneSchema } from "../schemas/work-milestone.schema";

export const workMilestoneQueryDto = workMilestoneSchema
	.pick({
		work_experience_id: true,
	})
	.partial()
	.extend(querySchema.shape);

export type WorkMilestoneQueryDto = z.infer<typeof workMilestoneQueryDto>;
