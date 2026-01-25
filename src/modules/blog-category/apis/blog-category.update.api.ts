import { useMutation } from "@vigilio/preact-fetching";
import type { BlogCategoryUpdateResponseDto } from "../dtos/blog-category.response.dto";
import type { BlogCategoryUpdateDto } from "../dtos/blog-category.update.dto";

export interface BlogCategoryUpdateApiError {
	success: false;
	message: string;
	body: keyof BlogCategoryUpdateDto;
}

export function blogCategoryUpdateApi(id: number) {
	return useMutation<
		BlogCategoryUpdateResponseDto,
		BlogCategoryUpdateDto,
		BlogCategoryUpdateApiError
	>(`/blog/categories/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PATCH",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
