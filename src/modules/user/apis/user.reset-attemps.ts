import { useMutation } from "@vigilio/preact-fetching";

export function userResetAttemptsApi(id: number) {
	return useMutation<
		UserResetAttemptsApiResult,
		null,
		UserResetAttemptsApiError
	>(`/users/${id}/reset-attempts`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
export interface UserResetAttemptsApiResult {
	success: true;
	message: string;
}
export interface UserResetAttemptsApiError {
	success: false;
	message: string;
}
