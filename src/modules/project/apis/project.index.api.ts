import type { Refetch } from "@infrastructure/types/client";
import type { Language } from "@infrastructure/types/i18n";
import { useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type { ProjectIndexResponseDto } from "../dtos/project.response.dto";

export type ProjectIndexSecondaryPaginator = "action";
export type ProjectIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type ProjectIndexTable = UseTable<
	Refetch<ProjectIndexResponseDto["results"]>,
	ProjectIndexSecondaryPaginator,
	ProjectIndexMethods
>;

export interface ProjectIndexApiError {
	success: false;
	message: string;
}

/**
 * projectIndex - /api/v1/project
 * @method GET
 */

export function projectIndexApi(
	table: ProjectIndexTable | null = null,
	paginator: UsePaginator | null = null,
	filters?: {
		limit?: number;
		is_featured?: boolean;
		language?: Language;
	},
) {
	const query = useQuery<ProjectIndexResponseDto, ProjectIndexApiError>(
		"/project",
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
				Object.entries(table.filters.value).forEach(([key, value]) => {
					if (value !== null && value !== undefined) {
						data.append(key, String(value));
					}
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
			if (filters?.is_featured !== undefined) {
				data.append("is_featured", String(filters.is_featured));
			}
			if (filters?.language) {
				data.append("language", filters.language);
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
