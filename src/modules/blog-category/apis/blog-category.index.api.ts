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

export function blogCategoryIndexApi(table: BlogCategoryIndexTable | null) {
	const query = useQuery<BlogCategoryIndexResponseDto, unknown>(
		"/blog/categories",
		async (url) => {
			const data = new URLSearchParams();
			if (table) {
				data.append("offset", String(table.pagination.value.offset));
				data.append("limit", String(table.pagination.value.limit));
				if (table.search.debounceTerm) {
					data.append("search", table.search.debounceTerm);
				}
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
			},
		},
	);
	return query;
}
