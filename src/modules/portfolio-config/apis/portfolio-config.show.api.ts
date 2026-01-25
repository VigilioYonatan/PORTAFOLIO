import { useQuery } from "@vigilio/preact-fetching";
import type { PortfolioConfigSchema } from "../schemas/portfolio-config.schema";

export interface PortfolioConfigShowApiError {
	success: false;
	message: string;
}

export interface PortfolioConfigShowResponse {
	success: true;
	config: PortfolioConfigSchema;
}

/**
 * portfolioConfigShow - /api/v1/config
 * @method GET
 */
export function portfolioConfigShowApi() {
	return useQuery<PortfolioConfigShowResponse, PortfolioConfigShowApiError>(
		"/config",
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
