import { useMutation } from "@vigilio/preact-fetching";
import type { PortfolioConfigCvResponseDto } from "../dtos/portfolio-config.response.dto";
import type { PortfolioConfigUpdateDto } from "../dtos/portfolio-config.update.dto";

export interface PortfolioConfigUpdateApiError {
	success: false;
	message: string;
	body: keyof PortfolioConfigUpdateDto;
}

/**
 * portfolioConfigUpdate - /api/v1/config
 * @method PATCH
 * @body PortfolioConfigUpdateDto
 */
export function portfolioConfigUpdateApi() {
	return useMutation<
		PortfolioConfigCvResponseDto,
		PortfolioConfigUpdateDto,
		PortfolioConfigUpdateApiError
	>("/config", async (url, body) => {
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
