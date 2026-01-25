import { useMutation } from "@vigilio/preact-fetching";
/**
 * tenantStore - /api/v1/tenants
 * @method POST
 * @body TenantStoreDto
 */
import type { TenantResponseDto } from "../dtos/tenant.response.dto";
import type { TenantStoreDto } from "../dtos/tenant.store.dto";
import type { TenantSchema } from "../schemas/tenant.schema";

/**
 * tenantStore - /api/v1/tenants
 * @method POST
 * @body TenantStoreDto
 */
export function tenantStoreApi() {
	return useMutation<TenantResponseDto, TenantStoreDto, TenantStoreApiError>(
		"/tenants",
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
