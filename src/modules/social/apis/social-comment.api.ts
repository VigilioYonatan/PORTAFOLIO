import { useMutation, useQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { UseTable } from "@vigilio/preact-table";
import type {
	SocialCommentDestroyResponseDto,
	SocialCommentIndexResponseDto,
	SocialCommentReplyResponseDto,
	SocialCommentStoreResponseDto,
	SocialCommentUpdateResponseDto,
} from "../dtos/social.response.dto";
import type { SocialCommentReplyDto } from "../dtos/social-comment.reply.dto";
import type { SocialCommentStoreDto } from "../dtos/social-comment.store.dto";
import type { SocialCommentUpdateDto } from "../dtos/social-comment.update.dto";
import type { SocialCommentSchema } from "../schemas/social-comment.schema";

export type SocialCommentIndexSecondaryPaginator = "action";
export type SocialCommentIndexMethods = {
	refetch: (clean?: boolean) => void;
};

export type SocialCommentIndexTable = UseTable<
	SocialCommentSchema,
	SocialCommentIndexSecondaryPaginator,
	SocialCommentIndexMethods
>;

export interface SocialCommentIndexApiError {
	success: false;
	message: string;
}

export function socialCommentIndexApi(
	table: SocialCommentIndexTable | null = null,
	paginator: UsePaginator | null = null,
) {
	const query = useQuery<
		SocialCommentIndexResponseDto,
		SocialCommentIndexApiError
	>(
		"/social-comment",
		async (url) => {
			const data = new URLSearchParams();

			if (table) {
				data.append("offset", String(table.pagination.value.offset));
				data.append("limit", String(table.pagination.value.limit));
				if (table.search.debounceTerm) {
					data.append("search", table.search.debounceTerm);
				}
				const sort = table.sort.value;
				const key = Object.keys(sort)[0];
				if (key) {
					data.append("sortBy", key);
					data.append("sortDir", sort[key]);
				}
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

export function socialCommentStoreApi() {
	return useMutation<
		SocialCommentStoreResponseDto,
		SocialCommentStoreDto,
		unknown
	>("/social-comment", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}

export function socialCommentUpdateApi(id: number | null) {
	return useMutation<
		SocialCommentUpdateResponseDto,
		SocialCommentUpdateDto,
		unknown
	>(`/social-comment/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PATCH",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}

export function socialCommentReplyApi(id: number | null) {
	return useMutation<
		SocialCommentReplyResponseDto,
		SocialCommentReplyDto,
		unknown
	>(`/social-comment/${id}/reply`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}

export function socialCommentDestroyApi(id: number | null) {
	return useMutation<SocialCommentDestroyResponseDto, unknown, unknown>(
		`/social-comment/${id}`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "DELETE",
			});
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
