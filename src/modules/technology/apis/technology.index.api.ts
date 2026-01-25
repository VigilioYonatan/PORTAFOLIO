import { useQuery } from "@vigilio/preact-fetching";
import type { TechnologyIndexResponseDto } from "../dtos/technology.response.dto";
import type { UseTable } from "@vigilio/preact-table";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { TechnologySchema } from "../schemas/technology.schema";

export type TechnologyIndexSecondaryPaginator = "action";
export type TechnologyIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type TechnologyIndexTable = UseTable<
	TechnologySchema,
	TechnologyIndexSecondaryPaginator,
	TechnologyIndexMethods
>;

export function technologyIndexApi(
	table: TechnologyIndexTable | null = null,
	paginator: UsePaginator | null = null,
	filters?: { limit?: number },
) {
	const query = useQuery<TechnologyIndexResponseDto, any>(
		"/technologies",
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
