import { z } from "@infrastructure/config/zod-i18n.config";
import { tenantSchema } from "../schemas/tenant.schema";

export const tenantUpdateDto = tenantSchema.pick({
	name: true,
	email: true,
	phone: true,
	address: true,
	logo: true,
	trial_ends_at: true,
});

export type TenantUpdateDto = z.infer<typeof tenantUpdateDto>;
