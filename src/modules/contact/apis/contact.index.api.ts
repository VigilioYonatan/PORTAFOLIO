import { useQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";
import type { ContactIndexResponseDto } from "../dtos/contact.response.dto";
import type { ContactMessageSchema } from "../schemas/contact-message.schema";

export type ContactIndexSecondaryPaginator = "action";
export type ContactIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type ContactIndexTable = UseTable<
	ContactMessageSchema,
	ContactIndexSecondaryPaginator,
	ContactIndexMethods
>;

export interface ContactIndexApiError {
	success: false;
	message: string;
}

/**
 * contactIndex - /api/v1/messages
 * @method GET
 */
export function contactIndexApi(
	table: ContactIndexTable | null,
	filters?: {
		limit?: number;
		is_read?: boolean;
	},
) {
	const query = useQuery<ContactIndexResponseDto, ContactIndexApiError>(
		"/messages",
		async (url) => {
			const data = new URLSearchParams();
			if (table) {
				data.append("offset", String(table.pagination.value.offset));
				data.append("limit", String(table.pagination.value.limit));
				if (table.search.debounceTerm) {
					data.append("search", table.search.debounceTerm);
				}
				if (
					table.pagination.value.cursor &&
					table.pagination.value.offset > 0
				) {
					data.append("cursor", String(table.pagination.value.cursor));
				}
				const sort = table.sort.value;
				const key = Object.keys(sort)[0];
				if (key) {
					data.append("sortBy", key);
					data.append("sortDir", sort[key]);
				}
				Object.entries(table.filters.value).forEach(([key, value]) => {
					data.append(key, String(value));
				});
			}
			if (filters?.limit) {
				data.append("limit", String(filters.limit));
			}
			if (filters?.is_read !== undefined) {
				data.append("is_read", String(filters.is_read));
			}

			const response = await fetch(`/api/v1${url}?${data}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
		{
			onSuccess(data) {
				const lastItem = data.results[data.results.length - 1];
				const nextCursor = lastItem ? lastItem.id : null;
				if (table) {
					table.updateData({
						result: data.results,
						count: data.count,
						methods: {
							refetch: query.refetch,
						},
						cursor: nextCursor,
					});
				}
			},
		},
	);
	return query;
}
