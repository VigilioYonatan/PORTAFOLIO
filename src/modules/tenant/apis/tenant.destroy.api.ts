import { useMutation } from "@vigilio/preact-fetching";
import type { TenantDestroyResponseDto } from "../dtos/tenant.response.dto";

export interface TenantDestroyApiError {
	success: false;
	message: string;
}

/**
 * tenantDestroy - /api/v1/tenant/:id
 * @method DELETE
 */
export function tenantDestroyApi() {
	return useMutation<TenantDestroyResponseDto, number, TenantDestroyApiError>(
		"/tenant",
		async (url, id) => {
			const response = await fetch(`/api/v1${url}/${id}`, {
				method: "DELETE",
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
