import { useQuery } from "@vigilio/preact-fetching";

export interface ChatSource {
	title: string;
	relevance: number;
	chunk_content: string;
}

export interface ChatMessage {
	id: number;
	role: "USER" | "ASSISTANT" | "SYSTEM";
	content: string;
	sources?: ChatSource[];
	created_at: string;
	updated_at: string;
	is_read: boolean;
	conversation_id: number;
	tenant_id: number;
}

export interface ChatMessageIndexResponse {
	results: ChatMessage[];
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
