import type { TenantSchema } from "../schemas/tenant.schema";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";

export const tenantLanguages: {
	key: TenantSettingSchema["default_language"];
	value: string;
}[] = [
	{ key: "ES", value: "Español" },
	{ key: "EN", value: "Inglés" },
	{ key: "PT", value: "Portugués" },
];

export const tenantTimezones: {
	key: TenantSettingSchema["time_zone"];
	value: string;
}[] = [
	{ key: "UTC", value: "UTC" },
	{ key: "America/Lima", value: "America/Lima" },
	{ key: "America/New_York", value: "America/New_York" },
];

export const tenantPlans: {
	key: TenantSchema["plan"];
	value: string;
}[] = [
	{ key: "FREE", value: "Gratis" },
	{ key: "BASIC", value: "Básico" },
	{ key: "PRO", value: "Pro" },
	{ key: "ENTERPRISE", value: "Enterprise" },
];
