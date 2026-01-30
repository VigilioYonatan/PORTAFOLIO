import { useMutation } from "@vigilio/preact-fetching";
import type { OpenSourceStoreResponseDto } from "../dtos/open-source.response.dto";
import type { OpenSourceStoreDto } from "../dtos/open-source.store.dto";

export interface OpenSourceStoreApiError {
	success: false;
	message: string;
	body: keyof OpenSourceStoreDto;
}

export function openSourceStoreApi() {
	return useMutation<
		OpenSourceStoreResponseDto,
		OpenSourceStoreDto,
		OpenSourceStoreApiError
	>("/opensource", async (url, body) => {
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
