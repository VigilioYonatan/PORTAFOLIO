import { useMutation } from "@vigilio/preact-fetching";
import type { BlogPostStoreResponseDto } from "../dtos/blog-post.response.dto";
import type { BlogPostStoreDto } from "../dtos/blog-post.store.dto";

export function blogPostStoreApi() {
	return useMutation<
		BlogPostStoreResponseDto,
		BlogPostStoreDto,
		BlogPostStoreApiError
	>("/blog-post", async (url, body) => {
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

export interface BlogPostStoreApiError {
	success: false;
	message: string;
	body: keyof BlogPostStoreDto;
}
