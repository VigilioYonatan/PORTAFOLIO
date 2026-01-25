import { useMutation } from "@vigilio/preact-fetching";
import type { AuthMfaVerifyResponseDto } from "../dtos/auth.response.dto";
import type { AuthMfaVerifyDto } from "../dtos/auth.mfa-verify.dto";

export interface AuthMfaVerifyApiError {
	success: false;
	message: string;
	body: keyof AuthMfaVerifyDto;
}

/**
 * authMfaVerify - /api/v1/auth/mfa/verify
 * @method POST
 * @body AuthMfaVerifyDto
 */
export function authMfaVerifyApi() {
	return useMutation<
		AuthMfaVerifyResponseDto,
		AuthMfaVerifyDto,
		AuthMfaVerifyApiError
	>("/auth/mfa/verify", async (url, body) => {
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
	});
}
