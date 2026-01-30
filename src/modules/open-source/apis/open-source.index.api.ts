import { useQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";
import type { OpenSourceIndexResponseDto } from "../dtos/open-source.response.dto";
import type { OpenSourceSchema } from "../schemas/open-source.schema";

export function openSourceIndexApi(
	table: UseTable<OpenSourceSchema, any, any>,
) {
	return useQuery<OpenSourceIndexResponseDto, string>(
		"/opensource",
		async (url) => {
			const searchParams = new URLSearchParams();
			searchParams.append("offset", String(table.pagination.value.offset));
			searchParams.append("limit", String(table.pagination.value.limit));
			if (table.search.debounceTerm) {
				searchParams.append("name", table.search.debounceTerm);
			}

			const response = await fetch(`/api/v1${url}?${searchParams.toString()}`);
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}

export type OpenSourceIndexSecondaryPaginator = any;
export type OpenSourceIndexMethods = any;
