import { useMutation } from "@vigilio/preact-fetching";
import type { ProjectSyncResponseDto } from "../dtos/project.response.dto";

export interface ProjectSyncApiError {
	success: false;
	message: string;
}

/**
 * projectSync - /api/v1/project/sync
 * @method POST
 */
export function projectSyncApi() {
	return useMutation<ProjectSyncResponseDto, number, ProjectSyncApiError>(
		"/project",
		async (url, id) => {
			const response = await fetch(`/api/v1${url}/${id}/sync`, {
				method: "POST",
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
