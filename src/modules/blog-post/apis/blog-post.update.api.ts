import { useMutation } from "@vigilio/preact-fetching";
import type { BlogPostUpdateResponseDto } from "../dtos/blog-post.response.dto";
import type { BlogPostUpdateDto } from "../dtos/blog-post.update.dto";

export interface BlogPostUpdateApiError {
	success: false;
	message: string;
	body: keyof BlogPostUpdateDto;
}

export function blogPostUpdateApi(id: number) {
	return useMutation<
		BlogPostUpdateResponseDto,
		BlogPostUpdateDto,
		BlogPostUpdateApiError
	>(`/blog-posts/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PUT",
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

export interface BlogPostUpdateApiError {
	success: false;
	message: string;
	body: keyof BlogPostUpdateDto;
}
