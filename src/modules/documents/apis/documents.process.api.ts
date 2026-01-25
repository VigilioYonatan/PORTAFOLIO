import { useMutation } from "@vigilio/preact-fetching";
import type { DocumentProcessResponseDto } from "../dtos/document.response.dto";

export interface DocumentsProcessApiError {
	success: false;
	message: string;
}

/**
 * documentsProcess - /api/v1/documents/:id/process
 * @method POST
 */
export function documentsProcessApi() {
	return useMutation<DocumentProcessResponseDto, number, DocumentsProcessApiError>(
		"/documents",
		async (url, id) => {
			const response = await fetch(`/api/v1${url}/${id}/process`, {
				method: "POST",
			});
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}
