import { useMutation } from "@vigilio/preact-fetching";
import type { TechnologyUpdateResponseDto } from "../dtos/technology.response.dto";
import type { TechnologyUpdateDto } from "../dtos/technology.update.dto";

export interface TechnologyUpdateApiError {
	success: false;
	message: string;
	body: keyof TechnologyUpdateDto;
}

export function technologyUpdateApi(id: number) {
	return useMutation<
		TechnologyUpdateResponseDto,
		TechnologyUpdateDto,
		TechnologyUpdateApiError
	>(`/technology/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
