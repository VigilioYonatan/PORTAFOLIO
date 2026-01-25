import type {
	PaginatorResult,
	PaginatorResultError,
} from "@infrastructure/types/client";
import { useQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";
import type { TenantSchema } from "../schemas/tenant.schema";

export type TenantIndexSecondaryPaginator = "action";
export type TenantIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type TenantIndexTable = UseTable<
	TenantSchema,
	TenantIndexSecondaryPaginator,
	TenantIndexMethods
>;

/**
 * tenantIndex - /api/v1/tenants
 * @method GET
 */
import type { TenantIndexResponseDto } from "../dtos/tenant.response.dto";

export function tenantIndexApi(table: TenantIndexTable | null) {
	const query = useQuery<TenantIndexResponseDto, PaginatorResultError>(
		"/tenants",
		async (url) => {
			const data = new URLSearchParams();
			if (table) {
				data.append("offset", String(table.pagination.value.offset));
				data.append("limit", String(table.pagination.value.limit));
				if (table?.search.debounceTerm) {
					data.append("search", table.search.debounceTerm);
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
					});
				}
			},
		},
	);
	return query;
}
