import { useMutation } from "@vigilio/preact-fetching";
import type { PortfolioConfigResponseDto } from "../dtos/portfolio-config.response.dto";
import type { PortfolioConfigUpdateDto } from "../dtos/portfolio-config.update.dto";

export interface PortfolioConfigUpdateApiError {
	success: false;
	message: string;
	body: keyof PortfolioConfigUpdateDto;
}

/**
 * portfolioConfigUpdate - /api/v1/portfolio-configs
 * @method PATCH
 * @body PortfolioConfigUpdateDto
 */
export function portfolioConfigUpdateApi() {
	return useMutation<
		PortfolioConfigResponseDto,
		PortfolioConfigUpdateDto,
		PortfolioConfigUpdateApiError
	>("/portfolio-configs", async (url, body) => {
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
