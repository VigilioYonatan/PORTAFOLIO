import { useMutation } from "@vigilio/preact-fetching";
import type { UserProfileUpdateDto } from "../dtos/user.profile.update.dto";
import type { UserUpdateResponseDto } from "../dtos/user.response.dto";

export interface UserProfileUpdateApiError {
	success: false;
	message: string;
	body: keyof UserProfileUpdateDto;
}

/**
 * userProfileUpdate - /api/v1/user/profile
 * @method PATCH
 */
export function userProfileUpdateApi() {
	return useMutation<
		UserUpdateResponseDto,
		UserProfileUpdateDto,
		UserProfileUpdateApiError
	>("/user/profile", async (url, body) => {
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
