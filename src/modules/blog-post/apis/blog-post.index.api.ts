import { useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type { BlogPostIndexResponseDto } from "../dtos/blog-post.response.dto";
import type { BlogPostSchema } from "../schemas/blog-post.schema";
import type { Language } from "@infrastructure/types/i18n";

export type BlogPostIndexSecondaryPaginator = "action";
export type BlogPostIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type BlogPostIndexTable = UseTable<
	BlogPostSchema,
	BlogPostIndexSecondaryPaginator,
	BlogPostIndexMethods
>;

export interface BlogPostIndexApiError {
	success: false;
	message: string;
}

/**
 * blogPostIndex - /api/v1/blog-post
 * @method GET
 */
export function blogPostIndexApi(
	table: BlogPostIndexTable | null = null,
	paginator: UsePaginator | null = null,
	filters?: {
		limit?: number;
		category_id?: number | null;
        language?: Language;
	},
) {
	const query = useQuery<BlogPostIndexResponseDto, BlogPostIndexApiError>(
		"/blog-post",
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
					data.append(key, String(value));
				});
			}

			if (paginator) {
				data.append("offset", String(paginator.pagination.value.offset));
				data.append("limit", String(paginator.pagination.value.limit));
				// data.append("language", String("en")); // Removed hardcoded

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

			if (filters?.limit) {
				data.append("limit", String(filters.limit));
			}
			if (filters?.category_id) {
				data.append("category_id", String(filters.category_id));
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
