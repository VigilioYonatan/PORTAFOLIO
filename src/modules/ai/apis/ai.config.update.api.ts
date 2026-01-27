import { useMutation } from "@vigilio/preact-fetching";
import type { AiConfigUpdateResponseDto } from "../dtos/ai.response.dto";
import type { AiConfigUpdateDto } from "../dtos/ai-config.update.dto";

export interface AiConfigUpdateApiError {
	success: false;
	message: string;
	body: keyof AiConfigUpdateDto;
}

export function aiConfigUpdateApi() {
	return useMutation<
		AiConfigUpdateResponseDto,
		AiConfigUpdateDto,
		AiConfigUpdateApiError
	>("/ai-config", async (url, body) => {
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
