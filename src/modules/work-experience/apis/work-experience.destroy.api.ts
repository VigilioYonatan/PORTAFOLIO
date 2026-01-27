import { useMutation } from "@vigilio/preact-fetching";
import type { WorkExperienceDestroyResponseDto } from "../dtos/work-experience.response.dto";

export interface WorkExperienceDestroyApiError {
	success: false;
	message: string;
}

/**
 * workExperienceDestroy - /api/v1/work-experience/:id
 * @method DELETE
 */
export function workExperienceDestroyApi() {
	return useMutation<
		WorkExperienceDestroyResponseDto,
		number,
		WorkExperienceDestroyApiError
	>("/work-experience", async (url, id) => {
		const response = await fetch(`/api/v1${url}/${id}`, {
			method: "DELETE",
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
