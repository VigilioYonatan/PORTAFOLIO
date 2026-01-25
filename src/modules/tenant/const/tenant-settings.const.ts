import type { TenantSchema } from "../schemas/tenant.schema";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";

export const LANGUAGE_OPTIONS: {
	key: TenantSettingSchema["default_language"];
	value: string;
}[] = [
	{ key: "EN", value: "English (United States)" },
	{ key: "ES", value: "Español (España)" },
	{ key: "PT", value: "Português (Brasil)" },
];

export const TIMEZONE_OPTIONS: {
	key: NonNullable<TenantSettingSchema["time_zone"]>;
	value: string;
}[] = [
	{ key: "UTC", value: "(UTC+00:00) Coordinated Universal Time" },
	{ key: "America/Lima", value: "(UTC-05:00) Lima, Bogota, Quito" },
	{ key: "America/New_York", value: "(UTC-05:00) Eastern Time (US & Canada)" },
];

export const PLAN_COLORS: Record<TenantSchema["plan"], string> = {
	FREE: "text-muted-foreground bg-muted",
	BASIC: "text-blue-400 bg-blue-500/10",
	PRO: "text-primary bg-primary/10",
	ENTERPRISE: "text-yellow-400 bg-yellow-500/10",
};

export const PLAN_FEATURES: Record<TenantSchema["plan"], string[]> = {
	FREE: ["Limited Links", "Basic Analytics"],
	BASIC: ["500 Links", "Basic Analytics", "Custom Domain"],
	PRO: ["Unlimited Links", "Advanced Analytics", "Team Management"],
	ENTERPRISE: ["Unlimited Everything", "Priority Support", "Custom SLA"],
};

export const THEME_OPTIONS: { key: "light" | "dark"; value: string }[] = [
	{ key: "light", value: "Light" },
	{ key: "dark", value: "Dark" },
];

// AI Configuration Options
// import type { AiModelConfigSchema } from "@modules/ai/schemas/ai-model-config.schema";

export const LLM_ENGINE_OPTIONS: {
	key: "gpt-4o" | "gpt-4o-mini" | "gpt-3.5-turbo"; // AiModelConfigSchema["chat_model"];
	value: string;
}[] = [
	{ key: "gpt-4o", value: "GPT-4o (Omni) - High Intelligence" },
	{ key: "gpt-4o-mini", value: "GPT-4o Mini - Balanced" },
	{ key: "gpt-3.5-turbo", value: "GPT-3.5 Turbo - Fast & Economical" },
];

export const CHUNK_SIZE_CONFIG = {
	min: 256,
	max: 3048,
	step: 64,
	default: 1024,
} as const;

export const TEMPERATURE_CONFIG = {
	min: 0,
	max: 1,
	step: 0.1,
	default: 0.7,
} as const;
