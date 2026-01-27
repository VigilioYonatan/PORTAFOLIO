import { useMutation } from "@vigilio/preact-fetching";
import type { ProjectDestroyResponseDto } from "../dtos/project.response.dto";

export interface ProjectDestroyApiError {
	success: false;
	message: string;
}

/**
 * projectDestroy - /api/v1/project/:id
 * @method DELETE
 */
export function projectDestroyApi() {
	return useMutation<ProjectDestroyResponseDto, number, ProjectDestroyApiError>(
		"/project",
		async (url, id) => {
			const response = await fetch(`/api/v1${url}/${id}`, {
				method: "DELETE",
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
