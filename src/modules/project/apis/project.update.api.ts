import { useMutation } from "@vigilio/preact-fetching";
import type { ProjectUpdateResponseDto } from "../dtos/project.response.dto";
import type { ProjectUpdateDto } from "../dtos/project.update.dto";

export interface ProjectUpdateApiError {
	success: false;
	message: string;
	body: keyof ProjectUpdateDto;
}

/**
 * projectUpdate - /api/v1/project/:id
 * @method PUT
 * @body ProjectUpdateDto
 */
export function projectUpdateApi(id: number) {
	return useMutation<
		ProjectUpdateResponseDto,
		ProjectUpdateDto,
		ProjectUpdateApiError
	>(`/project/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PUT",
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
