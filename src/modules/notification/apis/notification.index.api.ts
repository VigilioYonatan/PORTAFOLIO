import { useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type { NotificationIndexResponseDto } from "../dtos/notification.response.dto";
import type { NotificationSchema } from "../schemas/notification.schema";

export type NotificationIndexSecondaryPaginator = "action";
export type NotificationIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type NotificationIndexTable = UseTable<
	NotificationSchema,
	NotificationIndexSecondaryPaginator,
	NotificationIndexMethods
>;

export interface NotificationIndexApiError {
	success: false;
	message: string;
}

/**
 * notificationIndex - /api/v1/notification
 * @method GET
 */
export function notificationIndexApi(
	table: NotificationIndexTable | null = null,
	paginator: UsePaginator | null = null,
	filters?: { limit?: number; offset?: number },
) {
	const query = useQuery<NotificationIndexResponseDto, NotificationIndexApiError>(
		"/notification",
		async (url) => {
			const data = new URLSearchParams();

			if (table) {
				data.append("offset", String(table.pagination.value.offset));
				data.append("limit", String(table.pagination.value.limit));
				if (table.search.debounceTerm) {
					data.append("search", table.search.debounceTerm);
				}
				// Sort
				const sort = table.sort.value;
				const key = Object.keys(sort)[0];
				if (key) {
					data.append("sortBy", key);
					data.append("sortDir", sort[key]);
				}
				// Filters
				Object.entries(table.filters.value).forEach(([key, value]) => {
					data.append(key, String(value));
				});
			}

			if (paginator) {
				data.append("offset", String(paginator.pagination.value.offset));
				data.append("limit", String(paginator.pagination.value.limit));
			}

			if (filters?.limit) {
				data.append("limit", String(filters.limit));
			}
			if (filters?.offset) {
				data.append("offset", String(filters.offset));
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
