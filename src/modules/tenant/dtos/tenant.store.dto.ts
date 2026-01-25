import { z } from "@infrastructure/config/zod-i18n.config";
import { tenantSchema } from "../schemas/tenant.schema";

export const tenantStoreDto = tenantSchema.omit({
	id: true,
	slug: true,
	created_at: true,
	updated_at: true,
});

export type TenantStoreDto = z.infer<typeof tenantStoreDto>;
