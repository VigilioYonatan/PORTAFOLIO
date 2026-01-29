import type { PaginatorResultError } from "@infrastructure/types/client";
import { useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type { UserIndexSchema } from "../schemas/user.schema";

export type UserIndexSecondaryPaginator = "action" | "select";
export type UserIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type UserIndexTable = UseTable<
	UserIndexSchema,
	UserIndexSecondaryPaginator,
	UserIndexMethods
>;

/**
 * userIndex - /api/v1/user
 * @method GET
 */
import type { UserIndexResponseDto } from "../dtos/user.response.dto";

export function userIndexApi(
	table: UserIndexTable | null = null,
	paginator: UsePaginator | null = null,
) {
	const query = useQuery<UserIndexResponseDto, PaginatorResultError>(
		"/user",
		async (url) => {
			const data = new URLSearchParams();
			if (table) {
				data.append("offset", String(table.pagination.value.offset));
				data.append("limit", String(table.pagination.value.limit));
				if (table?.search.debounceTerm) {
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
				// Add internal table filters
				Object.entries(table.filters.value).forEach(([key, value]) => {
					data.append(key, String(value));
				});
			}

			if (paginator) {
				data.append("offset", String(paginator.pagination.value.offset));
				data.append("limit", String(paginator.pagination.value.limit));

				if (paginator.search.debounceTerm) {
					data.append("search", paginator.search.debounceTerm);
				}
				if (
					paginator.pagination.value.cursor &&
					paginator.pagination.value.offset > 0
				) {
					data.append("cursor", String(paginator.pagination.value.cursor));
				}
			}

			const response = await fetch(`/api/v1${url}?${data}`);
			const results = await response.json();
			if (!response.ok) {
				throw results;
			}
			return results;
		},
		{
			onSuccess(data) {
				if (table) {
					table.updateData({
						result: data.results,
						count: data.count,
						methods: {
							refetch: (clean?: boolean) => query.refetch(clean),
						},
						cursor: data.results[data.results.length - 1]?.id,
					});
				}
				if (paginator) {
					paginator.updateData({
						total: data.count,
						cursor: table
							? undefined
							: data.results[data.results.length - 1]?.id,
					});
				}
			},
		},
	);
	return query;
}

//Response Refetch
