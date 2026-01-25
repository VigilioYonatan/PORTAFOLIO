import { useMutation } from "@vigilio/preact-fetching";
import type { WorkMilestoneUpdateResponseDto } from "../dtos/work-milestone.response.dto";
import type { WorkMilestoneUpdateDto } from "../dtos/work-milestone.update.dto";

export interface WorkMilestoneUpdateApiError {
	success: false;
	message: string;
	body: keyof WorkMilestoneUpdateDto;
}

/**
 * workMilestoneUpdate - /api/v1/work-milestones/:id
 * @method PATCH
 * @body WorkMilestoneUpdateDto
 */
export function workMilestoneUpdateApi(id: number) {
	return useMutation<
		WorkMilestoneUpdateResponseDto,
		WorkMilestoneUpdateDto,
		WorkMilestoneUpdateApiError
	>(`/work-milestones/${id}`, async (url, body) => {
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
