import { useMutation } from "@vigilio/preact-fetching";
import type { TenantResponseDto } from "../dtos/tenant.response.dto";
import type { TenantStoreDto } from "../dtos/tenant.store.dto";

/**
 * tenantStore - /api/v1/tenant
 * @method POST
 * @body TenantStoreDto
 */
export function tenantStoreApi() {
	return useMutation<TenantResponseDto, TenantStoreDto, TenantStoreApiError>(
		"/tenant",
		async (url, body) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "POST",
				body: JSON.stringify(body),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}

export interface TenantStoreApiError {
	success: false;
	message: string;
	body: keyof TenantStoreDto;
}
