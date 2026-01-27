import { useQuery } from "@vigilio/preact-fetching";
import type { AiConfigSchema } from "../schemas/ai-config.schema";

export interface AiConfigShowResponse {
	success: boolean;
	config: AiConfigSchema;
}

export function aiConfigShowApi() {
	return useQuery<AiConfigShowResponse, unknown>("/ai-config", async (url) => {
		const response = await fetch(`/api/v1${url}`);
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
