import { useQuery } from "@vigilio/preact-fetching";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";

/**
 * tenantSettingShowMe - /api/v1/tenant-setting/me
 * @method GET
 */
export function tenantSettingShowMeApi() {
	return useQuery<TenantSettingShowMeApiResult, TenantSettingShowMeApiError>(
		"/tenant-setting/me",
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}

export interface TenantSettingShowMeApiResult {
	success: true;
	tenant_setting: TenantSettingSchema;
}

export interface TenantSettingShowMeApiError {
	success: false;
	message: string;
}
