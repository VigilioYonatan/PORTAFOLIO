import { useMutation } from "@vigilio/preact-fetching";
import type { AuthMfaDisableResponseDto } from "../dtos/auth.response.dto";

export interface AuthMfaDisableApiError {
	success: false;
	message: string;
}

/**
 * authMfaDisable - /api/v1/auth/mfa/disable
 * @method POST
 */
export function authMfaDisableApi() {
	return useMutation<AuthMfaDisableResponseDto, void, AuthMfaDisableApiError>(
		"/auth/mfa/disable",
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
