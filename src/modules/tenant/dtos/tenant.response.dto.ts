import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { tenantSchema } from "../schemas/tenant.schema";
import { tenantSettingSchema } from "../schemas/tenant-setting.schema";

// --- Index / List ---
export const tenantIndexResponseDto = createPaginatorSchema(tenantSchema);
export type TenantIndexResponseDto = z.infer<typeof tenantIndexResponseDto>;
export const tenantListResponseDto = tenantIndexResponseDto;
export type TenantListResponseApi = TenantIndexResponseDto;

// --- Show ---
export const tenantShowResponseDto = z.object({
	success: z.literal(true),
	tenant: tenantSchema.extend({
		setting: tenantSettingSchema,
	}),
});
export type TenantShowResponseDto = z.infer<typeof tenantShowResponseDto>;

// --- Store ---
export const tenantStoreResponseDto = z.object({
	success: z.literal(true),
	tenant: tenantSchema,
});
export type TenantStoreResponseDto = z.infer<typeof tenantStoreResponseDto>;

// --- Update ---
export const tenantUpdateResponseDto = z.object({
	success: z.literal(true),
	tenant: tenantSchema,
});
export type TenantUpdateResponseDto = z.infer<typeof tenantUpdateResponseDto>;

// --- Update Me ---
export const tenantUpdateMeResponseDto = z.object({
	success: z.literal(true),
	tenant: tenantSchema,
});
export type TenantUpdateMeResponseDto = z.infer<
	typeof tenantUpdateMeResponseDto
>;

// --- Destroy ---
export const tenantDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type TenantDestroyResponseDto = z.infer<typeof tenantDestroyResponseDto>;

// --- Settings ---
export const tenantSettingResponseDto = z.object({
	success: z.literal(true),
	setting: tenantSettingSchema,
});
export type TenantSettingResponseDto = z.infer<typeof tenantSettingResponseDto>;
export type TenantSettingResponseApi = z.infer<typeof tenantSettingResponseDto>;

// --- General/Generic (if needed, kept from original file) ---
export const tenantResponseDto = z.object({
	success: z.literal(true),
	tenant: tenantSchema.extend({
		setting: tenantSettingSchema,
	}),
});
export type TenantResponseDto = z.infer<typeof tenantResponseDto>;
export type TenantResponseApi = z.infer<typeof tenantResponseDto>;
