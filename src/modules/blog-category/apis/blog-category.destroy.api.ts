import { useMutation } from "@vigilio/preact-fetching";
import type { BlogCategoryDestroyResponseDto } from "../dtos/blog-category.response.dto";

export interface BlogCategoryDestroyApiError {
	success: false;
	message: string;
}

export function blogCategoryDestroyApi() {
	return useMutation<
		BlogCategoryDestroyResponseDto,
		number,
		BlogCategoryDestroyApiError
	>("/blog/categories", async (url, id) => {
			const response = await fetch(`/api/v1${url}/${id}`, {
				method: "DELETE",
			});
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
