import { useMutation } from "@vigilio/preact-fetching";
import type { ContactDestroyResponseDto } from "../dtos/contact-message.response.dto";

export interface ContactDestroyApiError {
	success: false;
	message: string;
}

/**
 * contactDestroy - /api/v1/contact-message/:id
 * @method DELETE
 */
export function contactDestroyApi() {
	return useMutation<ContactDestroyResponseDto, number, ContactDestroyApiError>(
		"/contact-message",
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
