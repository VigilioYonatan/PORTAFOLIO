import { useMutation } from "@vigilio/preact-fetching";
import type { AuthMfaSetupResponseDto } from "../dtos/auth.response.dto";

export interface AuthMfaSetupApiError {
	success: false;
	message: string;
}

/**
 * authMfaSetup - /api/v1/auth/mfa/setup
 * @method POST
 */
export function authMfaSetupApi() {
	return useMutation<AuthMfaSetupResponseDto, void, AuthMfaSetupApiError>(
		"/auth/mfa/setup",
		async (url) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
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
