import { useMutation } from "@vigilio/preact-fetching";
import type { TenantUpdateMeResponseDto } from "../dtos/tenant.response.dto";
import type { TenantUpdateDto } from "../dtos/tenant.update.dto";

export interface TenantUpdateMeApiError {
	success: false;
	message: string;
	body: keyof TenantUpdateDto;
}

/**
 * tenantUpdateMe - /api/v1/tenants/me
 * @method PUT
 * @body TenantUpdateDto
 */
export function tenantUpdateMeApi() {
	return useMutation<TenantUpdateMeResponseDto, TenantUpdateDto, TenantUpdateMeApiError>(
		"/tenants/me",
		async (url, body) => {
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
		},
	);
}
