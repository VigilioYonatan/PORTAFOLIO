import { useMutation } from "@vigilio/preact-fetching";
import type { ConversationStoreResponseDto } from "../dtos/chat.response.dto";
import type { ConversationStoreDto } from "../dtos/conversation.store.dto";

export interface ConversationStoreApiError {
	success: false;
	message: string;
	body: keyof ConversationStoreDto;
}

/**
 * conversationStore - /api/v1/chat/conversations
 * @method POST
 * @body ConversationStoreDto
 */
export function conversationStoreApi() {
	return useMutation<
		ConversationStoreResponseDto,
		ConversationStoreDto,
		ConversationStoreApiError
	>("/chat/conversations", async (url, body) => {
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
