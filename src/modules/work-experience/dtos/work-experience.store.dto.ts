import { z } from "@infrastructure/config/zod-i18n.config";
import { workExperienceSchema } from "../schemas/work-experience.schema";

export const workExperienceStoreDto = workExperienceSchema.omit({
	id: true,
	language: true,
	parent_id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type WorkExperienceStoreDto = z.infer<typeof workExperienceStoreDto>;
