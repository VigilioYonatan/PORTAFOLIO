import { useMutation } from "@vigilio/preact-fetching";
import type { UserDestroyResponseDto } from "../dtos/user.response.dto";

export interface UserDestroyApiError {
	success: false;
	message: string;
}

/**
 * userDestroy - /api/v1/users/:id
 * @method DELETE
 */
export function userDestroyApi() {
	return useMutation<UserDestroyResponseDto, number, UserDestroyApiError>(
		"/users",
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
