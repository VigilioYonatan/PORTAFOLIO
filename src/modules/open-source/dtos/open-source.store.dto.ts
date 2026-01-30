import { z } from "@infrastructure/config/zod-i18n.config";
import { openSourceSchema } from "../schemas/open-source.schema";

export const openSourceStoreDto = openSourceSchema.omit({
	id: true,
	parent_id: true,
	language: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type OpenSourceStoreDto = z.infer<typeof openSourceStoreDto>;
