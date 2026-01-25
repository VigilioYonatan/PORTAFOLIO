import { useMutation } from "@vigilio/preact-fetching";
import type { BlogCategoryStoreResponseDto } from "../dtos/blog-category.response.dto";
import type { BlogCategoryStoreDto } from "../dtos/blog-category.store.dto";

export interface BlogCategoryStoreApiError {
	success: false;
	message: string;
	body: keyof BlogCategoryStoreDto;
}

export function blogCategoryStoreApi() {
	return useMutation<
		BlogCategoryStoreResponseDto,
		BlogCategoryStoreDto,
		BlogCategoryStoreApiError
	>("/blog/categories", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
