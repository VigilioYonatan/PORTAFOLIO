import { useMutation } from "@vigilio/preact-fetching";
import type { AuthResetPasswordResponseDto } from "../dtos/auth.response.dto";
import type { AuthResetPasswordDto } from "../dtos/reset-password.dto";

export interface AuthResetPasswordApiError {
	success: false;
	message: string;
	body: keyof AuthResetPasswordDto;
}

/**
 * authResetPassword - /api/v1/auth/reset-password
 * @method POST
 * @body AuthResetPasswordDto
 */
export function authResetPasswordApi() {
	return useMutation<
		AuthResetPasswordResponseDto,
		AuthResetPasswordDto,
		AuthResetPasswordApiError
	>("/auth/reset-password", async (url, body) => {
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
