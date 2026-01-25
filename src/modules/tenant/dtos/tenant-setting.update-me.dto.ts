import { z } from "@infrastructure/config/zod-i18n.config";
import { tenantSettingSchema } from "../schemas/tenant-setting.schema";

export const tenantSettingUpdateMeDto = tenantSettingSchema.pick({
	color_primary: true,
	color_secondary: true,
	default_language: true,
	time_zone: true,
});

export type TenantSettingUpdateMeDto = z.infer<typeof tenantSettingUpdateMeDto>;
