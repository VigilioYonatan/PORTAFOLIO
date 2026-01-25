import { useMutation } from "@vigilio/preact-fetching";
import type { WorkExperienceStoreResponseDto } from "../dtos/work-experience.response.dto";
import type { WorkExperienceStoreDto } from "../dtos/work-experience.store.dto";

export interface WorkExperienceStoreApiError {
	success: false;
	message: string;
	body: keyof WorkExperienceStoreDto;
}

/**
 * workExperienceStore - /api/v1/work-experiences
 * @method POST
 * @body WorkExperienceStoreDto
 */
export function workExperienceStoreApi() {
	return useMutation<
		WorkExperienceStoreResponseDto,
		WorkExperienceStoreDto,
		WorkExperienceStoreApiError
	>("/work-experiences", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
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
