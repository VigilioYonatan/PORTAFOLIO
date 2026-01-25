import { useQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";
import type { TestimonialIndexResponseDto } from "../dtos/testimonial.response.dto";
import type { TestimonialSchema } from "../schemas/testimonial.schema";

export type TestimonialIndexSecondaryPaginator = "action";
export type TestimonialIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type TestimonialIndexTable = UseTable<
	TestimonialSchema,
	TestimonialIndexSecondaryPaginator,
	TestimonialIndexMethods
>;

export interface TestimonialIndexApiError {
	success: false;
	message: string;
}

/**
 * testimonialIndex - /api/v1/testimonials
 * @method GET
 */
import type { UsePaginator } from "@vigilio/preact-paginator";

export function testimonialIndexApi(
	table: TestimonialIndexTable | null = null,
	paginator: UsePaginator | null = null,
	filters?: {
		limit?: number;
	},
) {
	const query = useQuery<TestimonialIndexResponseDto, TestimonialIndexApiError>(
		"/testimonials",
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
					});
				}
			},
		},
	);
	return query;
}
