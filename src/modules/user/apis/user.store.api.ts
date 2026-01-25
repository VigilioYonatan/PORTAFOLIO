import { useMutation } from "@vigilio/preact-fetching";
import type { UserStoreResponseDto } from "../dtos/user.response.dto";
import type { UserStoreDto } from "../dtos/user.store.dto";

export interface UserStoreApiError {
	success: false;
	message: string;
	body: keyof UserStoreDto;
}

/**
 * userStore - /api/v1/users
 * @method POST
 * @body UserStoreDto
 */
export function userStoreApi() {
	return useMutation<UserStoreResponseDto, UserStoreDto, UserStoreApiError>(
		"/users",
		async (url, body) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "POST",
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
