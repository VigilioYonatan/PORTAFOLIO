import { useQuery } from "@vigilio/preact-fetching";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";

/**
 * tenantSettingShow - /api/v1/tenant/:id/settings
 * @method GET
 */
export function tenantSettingShowApi(tenant_id: number) {
	return useQuery<TenantSettingShowApiResult, TenantSettingShowApiError>(
		`/tenant/${tenant_id}/settings`,
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

export interface TenantSettingShowApiResult {
	success: true;
	tenant_setting: TenantSettingSchema;
}

export interface TenantSettingShowApiError {
	success: false;
	message: string;
}
