import { z } from "@infrastructure/config/zod-i18n.config";
import { workMilestoneSchema } from "../schemas/work-milestone.schema";

export const workMilestoneStoreDto = workMilestoneSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type WorkMilestoneStoreDto = z.infer<typeof workMilestoneStoreDto>;
