import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const tenantSettingSchema = z.object({
	id: z.number().int().positive(),
	is_verified: z.boolean(),
	color_primary: z.string().min(1).max(50),
	color_secondary: z.string().min(1).max(50),
	default_language: z.enum(["ES", "EN", "PT"]),
	time_zone: z
		.enum([
			"UTC",
			"America/Lima",
			"America/New_York",
			"America/Bogota",
			"America/Mexico_City",
		])
		.nullable(),
	tenant_id: z.number().int().positive(),
	...timeStampSchema.shape,
});

export type TenantSettingSchema = z.infer<typeof tenantSettingSchema>;
