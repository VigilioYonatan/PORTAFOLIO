import { z } from "@infrastructure/config/zod-i18n.config";
import { tenantSchema } from "../schemas/tenant.schema";

export const tenantUpdateMeDto = tenantSchema.pick({
	name: true,
	email: true,
	phone: true,
	address: true,
	logo: true,
});

export type TenantUpdateMeDto = z.infer<typeof tenantUpdateMeDto>;
