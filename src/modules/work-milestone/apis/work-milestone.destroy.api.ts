import { useMutation } from "@vigilio/preact-fetching";
import type { WorkMilestoneDestroyResponseDto } from "../dtos/work-milestone.response.dto";

export interface WorkMilestoneDestroyApiError {
	success: false;
	message: string;
}

/**
 * workMilestoneDestroy - /api/v1/work-milestones/:id
 * @method DELETE
 */
export function workMilestoneDestroyApi() {
	return useMutation<
		WorkMilestoneDestroyResponseDto,
		number,
		WorkMilestoneDestroyApiError
	>("/work-milestones", async (url, id) => {
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
