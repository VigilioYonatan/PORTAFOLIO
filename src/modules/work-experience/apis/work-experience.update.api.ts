import { useMutation } from "@vigilio/preact-fetching";
import type { WorkExperienceUpdateResponseDto } from "../dtos/work-experience.response.dto";
import type { WorkExperienceUpdateDto } from "../dtos/work-experience.update.dto";

export interface WorkExperienceUpdateApiError {
	success: false;
	message: string;
	body: keyof WorkExperienceUpdateDto;
}

/**
 * workExperienceUpdate - /api/v1/work-experiences/:id
 * @method PATCH
 * @body WorkExperienceUpdateDto
 */
export function workExperienceUpdateApi(id: number) {
	return useMutation<
		WorkExperienceUpdateResponseDto,
		WorkExperienceUpdateDto,
		WorkExperienceUpdateApiError
	>(`/work-experiences/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PATCH",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
