import { useMutation } from "@vigilio/preact-fetching";
import type { AuthLoginResponseApi } from "../dtos/auth.response.dto";
import type { AuthLoginDto } from "../dtos/login.dto";

export interface AuthLoginApiError {
	success: false;
	message: string;
	body: keyof AuthLoginDto;
	is_locked?: boolean;
	lockout_end_at?: string;
	remaining_attempts?: number;
}

/**
 * authLogin - /api/v1/auth/login
 * @method POST
 * @body AuthLoginDto
 */
export function authLoginApi() {
	return useMutation<AuthLoginResponseApi, AuthLoginDto, AuthLoginApiError>(
		"/auth/login",
		async (url, body) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				credentials: "include",
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
