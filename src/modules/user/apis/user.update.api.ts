import { useMutation } from "@vigilio/preact-fetching";
import type { UserUpdateResponseDto } from "../dtos/user.response.dto";
import type { UserUpdateDto } from "../dtos/user.update.dto";

export interface UserUpdateApiError {
	success: false;
	message: string;
	body: keyof UserUpdateDto;
}

/**
 * userUpdate - /api/v1/users/:id
 * @method PATCH
 * @body UserUpdateDto
 */
export function userUpdateApi(id: number) {
	return useMutation<UserUpdateResponseDto, UserUpdateDto, UserUpdateApiError>(
		`/users/${id}`,
		async (url, body) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "PATCH",
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
