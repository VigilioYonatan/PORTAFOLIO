import { useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type { ConversationIndexResponseClassDto } from "../dtos/chat.response.class.dto";
import type { ConversationSchema } from "../schemas/conversation.schema";

export type ConversationIndexMethods = {
	refetch: (clean?: boolean) => void;
};

export type ConversationIndexSecondaryPaginator = "action";
export type ConversationIndexTable = UseTable<
	ConversationSchema,
	ConversationIndexSecondaryPaginator,
	ConversationIndexMethods
>;

export interface ConversationIndexApiError {
	success: false;
	message: string;
}

/**
 * conversationIndex - /api/v1/chat/conversations
 * @method GET
 */
export function conversationIndexApi(
	table: ConversationIndexTable | null = null,
	paginator: UsePaginator | null = null,
) {
	const query = useQuery<ConversationIndexResponseClassDto, ConversationIndexApiError>(
		"/chat/conversations",
		async (url) => {
			const data = new URLSearchParams();

			if (table) {
				data.append("offset", String(table.pagination.value.offset));
				data.append("limit", String(table.pagination.value.limit));
				if (table.search.debounceTerm) {
					data.append("search", table.search.debounceTerm);
				}
				const sort = table.sort.value;
				const key = Object.keys(sort)[0];
				if (key) {
					data.append("sortBy", key);
					data.append("sortDir", sort[key]);
				}
			}

			if (paginator) {
				data.append("offset", String(paginator.pagination.value.offset));
				data.append("limit", String(paginator.pagination.value.limit));
			}

			const response = await fetch(`/api/v1${url}?${data}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
		{
			onSuccess(data) {
				if (table) {
					table.updateData({
						result: data.results,
						count: data.count,
						methods: {
							refetch: query.refetch,
						},
					});
				}
				if (paginator) {
					paginator.updateData({
						total: data.count,
					});
				}
			},
		},
	);
	return query;
}
