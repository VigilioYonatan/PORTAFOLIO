import { z } from "@infrastructure/config/zod-i18n.config";
import { technologySchema } from "../schemas/technology.schema";

export const technologyStoreDto = technologySchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type TechnologyStoreDto = z.infer<typeof technologyStoreDto>;
