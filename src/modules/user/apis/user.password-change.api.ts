import { useMutation } from "@vigilio/preact-fetching";
import type { UserPasswordChangeDto } from "../dtos/user.password-change.dto";
import type { UserDestroyResponseDto } from "../dtos/user.response.dto";

export interface UserPasswordChangeApiError {
	success: false;
	message: string;
	body: keyof UserPasswordChangeDto;
}

/**
 * userPasswordChange - /api/v1/user/password
 * @method PATCH
 */
export function userPasswordChangeApi() {
	return useMutation<
		UserDestroyResponseDto,
		UserPasswordChangeDto,
		UserPasswordChangeApiError
	>("/user/password", async (url, body) => {
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
