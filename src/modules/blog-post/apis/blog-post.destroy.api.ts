import { useMutation } from "@vigilio/preact-fetching";
import type { BlogPostDestroyResponseDto } from "../dtos/blog-post.response.dto";

export interface BlogPostDestroyApiError {
	success: false;
	message: string;
}

export function blogPostDestroyApi() {
	return useMutation<
		BlogPostDestroyResponseDto,
		number,
		BlogPostDestroyApiError
	>("/blog-post", async (url, id) => {
		const response = await fetch(`/api/v1${url}/${id}`, {
			method: "DELETE",
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
