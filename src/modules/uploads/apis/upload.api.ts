import { useMutation } from "@vigilio/preact-fetching";
import type { UploadResponseDto } from "../dtos/upload.response.dto";

export interface UploadApiError {
	success: false;
	message: string;
}

/**
 * upload - /api/v1/uploads
 * @method POST
 * @body FormData
 */
export function uploadApi() {
	return useMutation<UploadResponseDto, FormData, UploadApiError>(
		"/uploads",
		async (url, body) => {
			const response = await fetch(`/api/v1${url}`, {
				method: "POST",
				body, // Body is FormData
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
