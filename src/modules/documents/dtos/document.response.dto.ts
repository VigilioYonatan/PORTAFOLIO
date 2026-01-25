import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { documentSchema } from "../schemas/document.schema";

/**
 * Response DTO for paginated document list
 */
export const documentIndexResponseDto = createPaginatorSchema(documentSchema);
export type DocumentIndexResponseDto = z.infer<typeof documentIndexResponseDto>;

/**
 * Response DTO for single document (Show)
 */
export const documentShowResponseDto = z.object({
	success: z.literal(true),
	document: documentSchema,
});
export type DocumentShowResponseDto = z.infer<typeof documentShowResponseDto>;

/**
 * Response DTO for single document (Store)
 */
export const documentStoreResponseDto = z.object({
	success: z.literal(true),
	document: documentSchema,
});
export type DocumentStoreResponseDto = z.infer<typeof documentStoreResponseDto>;

/**
 * Response DTO for single document (Update)
 */
export const documentUpdateResponseDto = z.object({
	success: z.literal(true),
	document: documentSchema,
});
export type DocumentUpdateResponseDto = z.infer<
	typeof documentUpdateResponseDto
>;

/**
 * Response DTO for single document (Destroy)
 */
export const documentDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type DocumentDestroyResponseDto = z.infer<
	typeof documentDestroyResponseDto
>;

/**
 * Response DTO for process document
 */
export const documentProcessResponseDto = z.object({
	success: z.literal(true),
	document: documentSchema,
	message: z.string(),
});
export type DocumentProcessResponseDto = z.infer<
	typeof documentProcessResponseDto
>;

/**
 * Generic Response DTO for single document
 */
export const documentResponseDto = z.object({
	success: z.literal(true),
	document: documentSchema,
});
export type DocumentResponseDto = z.infer<typeof documentResponseDto>;
