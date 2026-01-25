import { useMutation } from "@vigilio/preact-fetching";
import type { AuthForgotPasswordResponseDto } from "../dtos/auth.response.dto";
import type { AuthForgotPasswordDto } from "../dtos/forgot-password.dto";

export interface AuthForgotPasswordApiError {
	success: false;
	message: string;
	body: keyof AuthForgotPasswordDto;
}

/**
 * authForgotPassword - /api/v1/auth/forgot-password
 * @method POST
 * @body AuthForgotPasswordDto
 */
export function authForgotPasswordApi() {
	return useMutation<
		AuthForgotPasswordResponseDto,
		AuthForgotPasswordDto,
		AuthForgotPasswordApiError
	>("/auth/forgot-password", async (url, body) => {
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
