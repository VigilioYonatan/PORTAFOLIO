import { useQuery } from "@vigilio/preact-fetching";

export interface ChatMessage {
	id: number;
	role: "USER" | "ASSISTANT" | "SYSTEM";
	content: string;
	sources?: any[];
	created_at: string;
	updated_at: string;
    is_read: boolean;
    conversation_id: number;
    tenant_id: number;
}

export interface ChatMessageIndexResponse {
	results: ChatMessage[];
}

export function chatMessageIndexApi(conversationId: number) {
	return useQuery<ChatMessageIndexResponse, unknown>(
		`/chat/messages/${conversationId}`,
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
        }
	);
}
