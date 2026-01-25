import { useMutation } from "@vigilio/preact-fetching";

export interface NotificationDestroyApiError {
	success: false;
	message: string;
}

/**
 * notificationDestroy - /api/v1/notifications/:id
 * @method DELETE
 */
export function notificationDestroyApi() {
	return useMutation<{ success: true; message: string }, number, NotificationDestroyApiError>(
		"/notifications",
		async (url, id) => {
			const response = await fetch(`/api/v1${url}/${id}`, {
				method: "DELETE",
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
