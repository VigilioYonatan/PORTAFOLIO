import { useMutation } from "@vigilio/preact-fetching";
import type { ContactStoreDto } from "../dtos/contact.store.dto";
import type { ContactStoreResponseDto } from "../dtos/contact.response.dto";

export interface ContactStoreApiError {
	success: false;
	message: string;
	body: string;
}

/**
 * contactStoreApi - /api/v1/contact-message
 * @method POST
 */
export function contactStoreApi() {
	return useMutation<ContactStoreResponseDto, ContactStoreDto, ContactStoreApiError>(
		"/contact-message",
		async (url, body) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "POST",
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
		},
	);
}
