import { useMutation } from "@vigilio/preact-fetching";
import type { TechnologyDestroyResponseDto } from "../dtos/technology.response.dto";

export interface TechnologyDestroyApiError {
	success: false;
	message: string;
}

export function technologyDestroyApi() {
	return useMutation<
		TechnologyDestroyResponseDto,
		number,
		TechnologyDestroyApiError
	>("/technology", async (url, id) => {
		const response = await fetch(`/api/v1${url}/${id}`, {
			method: "DELETE",
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
