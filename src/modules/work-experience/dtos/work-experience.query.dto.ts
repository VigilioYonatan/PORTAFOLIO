import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { workExperienceSchema } from "../schemas/work-experience.schema";

export const workExperienceQueryDto = workExperienceSchema
	.pick({
		is_visible: true,
		is_current: true,
	})
	.partial()
	.extend(querySchema.shape);

export type WorkExperienceQueryDto = z.infer<typeof workExperienceQueryDto>;
