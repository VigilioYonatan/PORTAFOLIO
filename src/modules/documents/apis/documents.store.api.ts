import { useMutation } from "@vigilio/preact-fetching";
import type { DocumentStoreResponseDto } from "../dtos/document.response.dto";
import type { DocumentStoreDto } from "../dtos/document.store.dto";

export interface DocumentsStoreApiError {
	success: false;
	message: string;
	body: keyof DocumentStoreDto;
}

/**
 * documentsStore - /api/v1/documents
 * @method POST
 * @body DocumentStoreDto
 */
export function documentsStoreApi() {
	return useMutation<DocumentStoreResponseDto, DocumentStoreDto, DocumentsStoreApiError>(
		"/documents",
		async (url, body) => {
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
		},
	);
}
