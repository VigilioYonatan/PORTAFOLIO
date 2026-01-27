import { useMutation } from "@vigilio/preact-fetching";
import type { AiInsightGenerateResponseDto } from "../dtos/analytics.response.dto";

export interface AnalyticsInsightGenerateApiError {
	success: false;
	message: string;
}

/**
 * analyticsInsightGenerate - /api/v1/ai-insight/generate
 * @method POST
 */
export function analyticsInsightGenerateApi() {
	return useMutation<
		AiInsightGenerateResponseDto,
		any,
		AnalyticsInsightGenerateApiError
	>("/ai-insight/generate", async (url, body) => {
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
