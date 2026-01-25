import { useQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";
import type { MusicTrackIndexResponseDto } from "../dtos/music.response.dto";
import type { MusicTrackSchema } from "../schemas/music.schema";

export type MusicIndexSecondaryPaginator = "action";
export type MusicIndexMethods = {
	refetch: (clean?: boolean) => void;
};
export type MusicIndexTable = UseTable<
	MusicTrackSchema,
	MusicIndexSecondaryPaginator,
	MusicIndexMethods
>;

export interface MusicIndexApiError {
	success: false;
	message: string;
}

/**
 * musicIndex - /api/v1/music
 * @method GET
 */
import type { UsePaginator } from "@vigilio/preact-paginator";

export function musicIndexApi(
	table: MusicIndexTable | null = null,
	paginator: UsePaginator | null = null,
	filters?: {
		limit?: number;
		is_featured?: boolean;
	},
) {
	const query = useQuery<MusicTrackIndexResponseDto, MusicIndexApiError>(
		"/music",
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
			}

			if (filters?.limit) {
				data.append("limit", String(filters.limit));
			}
			if (filters?.is_featured !== undefined) {
				data.append("is_featured", String(filters.is_featured));
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

export async function musicTrackIndexFetch(
	url = "/music",
	table: MusicIndexTable | null = null,
	offset = 0,
	limit = 20,
): Promise<MusicTrackIndexResponseDto> {
	const data = new URLSearchParams();
	// Basic params for store usage
	data.append("offset", String(offset));
	data.append("limit", String(limit));

	// If table provided (reuse logic if needed, but store passes null)
	if (table) {
		// ... logic matching hook if we want full reuse, but for now store just needs offset/limit
	}

	const response = await fetch(`/api/v1${url}?${data}`);
	const result = await response.json();
	if (!response.ok) throw result;
	return result;
}
