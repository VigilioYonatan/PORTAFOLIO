import { useQuery } from "@vigilio/preact-fetching";
import type { AiInsightIndexResponseDto } from "../dtos/analytics.response.dto";

export function analyticsInsightIndexApi(filters?: {
	limit?: number;
	offset?: number;
}) {
	return useQuery<AiInsightIndexResponseDto, unknown>(
		"/analytics/insights",
		async (url) => {
			const queryParams = new URLSearchParams();
			if (filters?.limit) queryParams.append("limit", String(filters.limit));
			if (filters?.offset) queryParams.append("offset", String(filters.offset));

			const response = await fetch(`/api/v1${url}?${queryParams.toString()}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
