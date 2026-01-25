import { z } from "@infrastructure/config/zod-i18n.config";
import { technologySchema } from "../schemas/technology.schema";

export const technologyUpdateDto = technologySchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type TechnologyUpdateDto = z.infer<typeof technologyUpdateDto>;
