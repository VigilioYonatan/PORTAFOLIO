import { useMutation } from "@vigilio/preact-fetching";
import type { ChatMessagePublicStoreResponseDto } from "../dtos/chat.response.dto";
import type { ChatMessagePublicStoreDto } from "../dtos/chat-message.public-store.dto";

export interface ChatMessagePublicStoreApiError {
	success: false;
	message: string;
	body: keyof ChatMessagePublicStoreDto;
}

/**
 * chatMessagePublicStore - /api/v1/chat/contact/public
 * @method POST
 * @body ChatMessagePublicStoreDto
 */
export function chatMessagePublicStoreApi(conversationId: number) {
	return useMutation<
		ChatMessagePublicStoreResponseDto,
		ChatMessagePublicStoreDto,
		ChatMessagePublicStoreApiError
	>(`/chat/conversations/${conversationId}/contact`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
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
