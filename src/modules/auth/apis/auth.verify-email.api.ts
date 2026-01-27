import { useMutation } from "@vigilio/preact-fetching";
import type { AuthVerifyEmailResponseDto } from "../dtos/auth.response.dto";
import type { AuthVerifyEmailDto } from "../dtos/verify-email.dto";

export interface AuthVerifyEmailApiError {
	success: false;
	message: string;
	body: keyof AuthVerifyEmailDto;
}

/**
 * authVerifyEmail - /api/v1/auth/verify-email
 * @method POST
 * @body AuthVerifyEmailDto
 */
export function authVerifyEmailApi() {
	return useMutation<
		AuthVerifyEmailResponseDto,
		AuthVerifyEmailDto,
		AuthVerifyEmailApiError
	>("/auth/verify-email", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
