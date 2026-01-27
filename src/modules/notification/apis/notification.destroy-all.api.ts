import { useMutation } from "@vigilio/preact-fetching";
import type { NotificationDestroyAllResponseDto } from "../dtos/notification.response.dto";

export interface NotificationDestroyAllApiError {
	success: false;
	message: string;
}

/**
 * notificationDestroyAll - /api/v1/notification
 * @method DELETE
 */
export function notificationDestroyAllApi() {
	return useMutation<
		NotificationDestroyAllResponseDto,
		void,
		NotificationDestroyAllApiError
	>("/notification", async (url) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "DELETE",
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
