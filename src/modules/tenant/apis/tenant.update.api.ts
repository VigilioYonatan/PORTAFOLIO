import { useMutation } from "@vigilio/preact-fetching";
import type { TenantUpdateResponseDto } from "../dtos/tenant.response.dto";
import type { TenantUpdateDto } from "../dtos/tenant.update.dto";

export interface TenantUpdateApiError {
	success: false;
	message: string;
	body: keyof TenantUpdateDto;
}

/**
 * tenantUpdate - /api/v1/tenant/:id
 * @method PUT
 * @body TenantUpdateDto
 */
export function tenantUpdateApi(id: number) {
	return useMutation<
		TenantUpdateResponseDto,
		TenantUpdateDto,
		TenantUpdateApiError
	>(`/tenant/${id}`, async (url, body) => {
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
