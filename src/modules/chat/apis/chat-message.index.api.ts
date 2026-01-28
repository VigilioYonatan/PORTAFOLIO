import { useQuery } from "@vigilio/preact-fetching";
import type { ChatMessageSchema } from "../schemas/chat-message.schema";

// Re-export the type from schema for use in components
export type ChatMessage = Omit<ChatMessageSchema, "sources"> & {
	sources?: Array<{
		title: string;
		relevance: number;
		chunk_content: string;
	}>;
};

export interface ChatMessageIndexResponse {
	success: boolean;
	messages: ChatMessage[];
}

export interface ChatMessageIndexApiError {
	success: false;
	message: string;
}

/**
 * chatMessageIndex - /api/v1/chat/contact/${conversationId}
 * @method GET
 */
export function chatMessageIndexApi(conversationId: number) {
	return useQuery<ChatMessageIndexResponse, ChatMessageIndexApiError>(
		`/chat/conversations/${conversationId}/messages`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
		{
			skipFetching: !conversationId, // Skip if no ID
		},
	);
}
