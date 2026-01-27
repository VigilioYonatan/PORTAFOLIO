import { useMutation } from "@vigilio/preact-fetching";
import type { AuthLoginResponseApi } from "../dtos/auth.response.dto";
import type { AuthMfaLoginDto } from "../dtos/mfa-login.dto";

export interface AuthMfaLoginApiError {
	success: false;
	message: string;
	body: keyof AuthMfaLoginDto;
}

/**
 * authMfaLogin - /api/v1/auth/login/mfa
 * @method POST
 * @body AuthMfaLoginDto
 */
export function authMfaLoginApi() {
	return useMutation<
		AuthLoginResponseApi,
		AuthMfaLoginDto,
		AuthMfaLoginApiError
	>("/auth/login/mfa", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
