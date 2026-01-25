import { useMutation } from "@vigilio/preact-fetching";
import type { ProjectStoreResponseDto } from "../dtos/project.response.dto";
import type { ProjectStoreDto } from "../dtos/project.store.dto";

export interface ProjectStoreApiError {
	success: false;
	message: string;
	body: keyof ProjectStoreDto;
}

/**
 * projectStore - /api/v1/projects
 * @method POST
 * @body ProjectStoreDto
 */
export function projectStoreApi() {
	return useMutation<
		ProjectStoreResponseDto,
		ProjectStoreDto,
		ProjectStoreApiError
	>("/projects", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
