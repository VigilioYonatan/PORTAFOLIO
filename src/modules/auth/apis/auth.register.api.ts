import { useMutation } from "@vigilio/preact-fetching";
import type { AuthRegisterResponseApi } from "../dtos/auth.response.dto";
import type { AuthRegisterDto } from "../dtos/register.dto";

export interface AuthRegisterApiError {
	success: false;
	message: string;
	body: keyof AuthRegisterDto;
}

/**
 * authRegister - /api/v1/auth/register
 * @method POST
 * @body AuthRegisterDto
 */
export function authRegisterApi() {
	return useMutation<
		AuthRegisterResponseApi,
		AuthRegisterDto,
		AuthRegisterApiError
	>("/auth/register", async (url, body) => {
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
