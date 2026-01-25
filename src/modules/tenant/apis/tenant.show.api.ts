import { useQuery } from "@vigilio/preact-fetching";
import type { TenantResponseDto } from "../dtos/tenant.response.dto";
import type { TenantShowSchema } from "../schemas/tenant.schema";

/**
 * tenantShow - /api/v1/tenants/:id
 * @method GET
 */
export function tenantShowApi(id: number) {
	return useQuery<TenantResponseDto, TenantShowApiError>(
		`/tenants/${id}`,
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

export interface TenantShowApiResult {
	success: true;
	tenant: TenantShowSchema;
}

export interface TenantShowApiError {
	success: false;
	message: string;
}
