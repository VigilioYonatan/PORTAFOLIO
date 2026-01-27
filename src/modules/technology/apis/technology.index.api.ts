import type { PaginatorResultError } from "@infrastructure/types/client";
import { useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type { TechnologyIndexResponseDto } from "../dtos/technology.response.dto";
import type { TechnologySchema } from "../schemas/technology.schema";

export type TechnologyIndexSecondaryPaginator = "action";
export type TechnologyIndexMethods = {
	refetch?: (clean?: boolean) => void;
};
export type TechnologyIndexTable = UseTable<
	TechnologySchema,
	TechnologyIndexSecondaryPaginator,
	TechnologyIndexMethods
>;

/**
 * technologyIndex - /api/v1/technology
 * @method GET
 */
export function technologyIndexApi(
	table: TechnologyIndexTable | null = null,
	paginator: UsePaginator | null = null,
	filters?: { limit?: number },
) {
	const query = useQuery<TechnologyIndexResponseDto, PaginatorResultError>(
		"/technology",
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
				if (
					paginator.pagination.value.cursor &&
					paginator.pagination.value.offset > 0
				) {
					data.append("cursor", String(paginator.pagination.value.cursor));
				}
			}

			if (filters?.limit) {
				data.append("limit", String(filters.limit));
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
				if (paginator) {
					paginator.updateData({
						total: data.count,
						cursor: nextCursor,
					});
				}
			},
		},
	);
	return query;
}
