import { useMutation } from "@vigilio/preact-fetching";
import type { TenantSettingResponseDto } from "../dtos/tenant.response.dto";
import type { TenantSettingUpdateMeDto } from "../dtos/tenant-setting.update-me.dto";

export interface TenantSettingUpdateMeApiError {
	success: false;
	message: string;
	body: keyof TenantSettingUpdateMeDto;
}

/**
 * tenantSettingUpdateMe - /api/v1/tenant-setting/me
 * @method PUT
 * @body TenantSettingUpdateMeDto
 */
export function tenantSettingUpdateMeApi() {
	return useMutation<
		TenantSettingResponseDto,
		TenantSettingUpdateMeDto,
		TenantSettingUpdateMeApiError
	>("/tenant-setting/me", async (url, body) => {
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
