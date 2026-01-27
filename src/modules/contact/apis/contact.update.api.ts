import { useMutation } from "@vigilio/preact-fetching";
import type { ContactUpdateResponseDto } from "../dtos/contact.response.dto";
import type { ContactUpdateDto } from "../dtos/contact.update.dto";

export interface ContactUpdateApiError {
	success: false;
	message: string;
}

/**
 * contactUpdate - /api/v1/contact-message/:id
 * @method PATCH
 */
export function contactUpdateApi(id: number) {
	return useMutation<
		ContactUpdateResponseDto,
		ContactUpdateDto,
		ContactUpdateApiError
	>(`/contact-message/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
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
