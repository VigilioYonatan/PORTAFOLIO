import { useMutation } from "@vigilio/preact-fetching";
import type { ContactUpdateResponseDto } from "../dtos/contact-message.response.dto";

export interface ContactMarkAsReadApiError {
	success: false;
	message: string;
}

/**
 * contactMarkAsRead - /api/v1/contact-message/:id/read
 * @method PATCH
 */
export function contactMarkAsReadApi() {
	return useMutation<
		ContactUpdateResponseDto,
		number,
		ContactMarkAsReadApiError
	>("/contact-message", async (url, id) => {
		const response = await fetch(`/api/v1${url}/${id}/read`, {
			method: "PATCH",
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
