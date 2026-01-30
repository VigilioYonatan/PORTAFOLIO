import { useMutation } from "@vigilio/preact-fetching";
import type { OpenSourceDestroyResponseDto } from "../dtos/open-source.response.dto";

export function openSourceDestroyApi() {
	return useMutation<OpenSourceDestroyResponseDto, number, { message: string }>(
		"/opensource",
		async (url, id) => {
			const response = await fetch(`/api/v1${url}/${id}`, {
				method: "DELETE",
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
