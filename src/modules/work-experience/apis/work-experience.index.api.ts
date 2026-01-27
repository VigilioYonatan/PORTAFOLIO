import { useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type { WorkExperienceIndexResponseDto } from "../dtos/work-experience.response.dto";
import type { WorkExperienceSchema } from "../schemas/work-experience.schema";

export type WorkExperienceIndexSecondaryPaginator = "action";
export type WorkExperienceIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type WorkExperienceIndexTable = UseTable<
	WorkExperienceSchema,
	WorkExperienceIndexSecondaryPaginator,
	WorkExperienceIndexMethods
>;

export interface WorkExperienceIndexApiError {
	success: false;
	message: string;
}

/**
 * workExperienceIndex - /api/v1/experiences
 * @method GET
 */
export function workExperienceIndexApi(
	table: WorkExperienceIndexTable | null = null,
	paginator: UsePaginator | null = null,
) {
	const query = useQuery<
		WorkExperienceIndexResponseDto,
		WorkExperienceIndexApiError
	>(
		"/experiences",
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
					});
				}
			},
		},
	);
	return query;
}
