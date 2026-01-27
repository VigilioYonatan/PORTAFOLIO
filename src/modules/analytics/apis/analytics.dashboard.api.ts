import { useQuery } from "@vigilio/preact-fetching";
import type { DashboardResponseDto } from "../dtos/dashboard.response.dto";

export interface AnalyticsDashboardApiError {
	success: false;
	message: string;
}

/**
 * analyticsDashboard - /api/v1/analytics/dashboard
 * @method GET
 */
export function analyticsDashboardApi() {
	return useQuery<DashboardResponseDto, AnalyticsDashboardApiError>(
		"/analytics/dashboard",
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
