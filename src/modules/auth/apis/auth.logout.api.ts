import { useMutation } from "@vigilio/preact-fetching";
import type { AuthLogoutResponseDto } from "../dtos/auth.response.dto";

export interface AuthLogoutApiError {
	success: false;
	message: string;
}

/**
 * authLogout - /api/v1/auth/logout
 * @method POST
 */
export function authLogoutApi() {
	return useMutation<AuthLogoutResponseDto, void, AuthLogoutApiError>(
		"/auth/logout",
		async (url) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "POST",
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
