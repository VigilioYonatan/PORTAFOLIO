import { useMutation } from "@vigilio/preact-fetching";
import type { OpenSourceUpdateResponseDto } from "../dtos/open-source.response.dto";
import type { OpenSourceUpdateDto } from "../dtos/open-source.update.dto";

export interface OpenSourceUpdateApiError {
	success: false;
	message: string;
	body: keyof OpenSourceUpdateDto;
}

export function openSourceUpdateApi(id: number) {
	return useMutation<
		OpenSourceUpdateResponseDto,
		OpenSourceUpdateDto,
		OpenSourceUpdateApiError
	>(`/opensource/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PUT",
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
