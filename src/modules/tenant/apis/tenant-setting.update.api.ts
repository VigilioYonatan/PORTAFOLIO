import { useMutation } from "@vigilio/preact-fetching";
import type { TenantSettingResponseDto } from "../dtos/tenant.response.dto";
import type { TenantSettingUpdateDto } from "../dtos/tenant-setting.update.dto";

export interface TenantSettingUpdateApiError {
	success: false;
	message: string;
	body: keyof TenantSettingUpdateDto;
}

/**
 * tenantSettingUpdate - /api/v1/tenants/:id/settings
 * @method PUT
 * @body TenantSettingUpdateDto
 */
export function tenantSettingUpdateApi(tenant_id: number) {
	return useMutation<
		TenantSettingResponseDto,
		TenantSettingUpdateDto,
		TenantSettingUpdateApiError
	>(`/tenants/${tenant_id}/settings`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
