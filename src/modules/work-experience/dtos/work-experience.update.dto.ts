import { z } from "@infrastructure/config/zod-i18n.config";
import { workExperienceSchema } from "../schemas/work-experience.schema";

export const workExperienceUpdateDto = workExperienceSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type WorkExperienceUpdateDto = z.infer<typeof workExperienceUpdateDto>;
