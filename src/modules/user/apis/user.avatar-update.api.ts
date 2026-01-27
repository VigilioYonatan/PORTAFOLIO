import { useMutation } from "@vigilio/preact-fetching";
import type { UserAvatarUpdateDto } from "../dtos/user.avatar.update.dto";
import type { UserUpdateResponseDto } from "../dtos/user.response.dto";

export interface UserAvatarUpdateApiError {
	success: false;
	message: string;
	body: keyof UserAvatarUpdateDto;
}

/**
 * userAvatarUpdate - /api/v1/user/avatar
 * @method PATCH
 */
export function userAvatarUpdateApi() {
	return useMutation<
		UserUpdateResponseDto,
		UserAvatarUpdateDto,
		UserAvatarUpdateApiError
	>("/user/avatar", async (url, body) => {
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
	});
}
