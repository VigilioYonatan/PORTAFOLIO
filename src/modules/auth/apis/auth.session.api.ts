export interface SessionApiResult {
	user: {
		id: number;
		email: string;
		full_name: string;
	} | null;
}

export interface SessionApiError {
	message: string;
}

/**
 * session - /api/v1/auth/session
 * @method GET
 */
export async function authSessionApi(): Promise<SessionApiResult> {
	const response = await fetch("/api/v1/auth/session", {
		credentials: "include",
	});
	const result = await response.json();
	if (!response.ok) {
		throw result;
	}
	return result;
}
