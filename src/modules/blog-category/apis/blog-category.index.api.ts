import { useQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";
import type { BlogCategoryIndexResponseDto } from "../dtos/blog-category.response.dto";
import type { BlogCategorySchema } from "../schemas/blog-category.schema";

export type BlogCategoryIndexSecondaryPaginator = "action";
export type BlogCategoryIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type BlogCategoryIndexTable = UseTable<
	BlogCategorySchema,
	BlogCategoryIndexSecondaryPaginator,
	BlogCategoryIndexMethods
>;

export interface BlogCategoryIndexApiError {
	success: false;
	message: string;
}

/**
 * blogCategoryIndex - /api/v1/blog-category
 * @method GET
 */
export function blogCategoryIndexApi(table: BlogCategoryIndexTable | null) {
	const query = useQuery<
		BlogCategoryIndexResponseDto,
		BlogCategoryIndexApiError
	>(
		"/blog-category",
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
