import { useMutation } from "@vigilio/preact-fetching";
import type { NotificationUpdateResponseDto } from "../dtos/notification.response.dto";
import type { NotificationUpdateDto } from "../dtos/notification.update.dto";

export interface NotificationUpdateApiError {
	success: false;
	message: string;
	body: keyof NotificationUpdateDto;
}

/**
 * notificationUpdate - /api/v1/notifications/:id
 * @method PATCH
 */
export function notificationUpdateApi() {
	return useMutation<
		NotificationUpdateResponseDto,
		{ id: number; body: NotificationUpdateDto },
		NotificationUpdateApiError
	>("/notifications", async (url, { id, body }) => {
		const response = await fetch(`/api/v1${url}/${id}`, {
			method: "PATCH",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
