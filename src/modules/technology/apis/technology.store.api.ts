import { useMutation } from "@vigilio/preact-fetching";
import type { TechnologyStoreResponseDto } from "../dtos/technology.response.dto";
import type { TechnologyStoreDto } from "../dtos/technology.store.dto";

export interface TechnologyStoreApiError {
	success: false;
	message: string;
	body: keyof TechnologyStoreDto;
}

export function technologyStoreApi() {
	return useMutation<
		TechnologyStoreResponseDto,
		TechnologyStoreDto,
		TechnologyStoreApiError
	>("/technologies", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
