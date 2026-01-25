import { useMutation } from "@vigilio/preact-fetching";
import type { WorkMilestoneStoreResponseDto } from "../dtos/work-milestone.response.dto";
import type { WorkMilestoneStoreDto } from "../dtos/work-milestone.store.dto";

export interface WorkMilestoneStoreApiError {
	success: false;
	message: string;
	body: keyof WorkMilestoneStoreDto;
}

/**
 * workMilestoneStore - /api/v1/work-milestones
 * @method POST
 * @body WorkMilestoneStoreDto
 */
export function workMilestoneStoreApi() {
	return useMutation<
		WorkMilestoneStoreResponseDto,
		WorkMilestoneStoreDto ,
		WorkMilestoneStoreApiError
	>("/work-milestones", async (url, body) => {
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
