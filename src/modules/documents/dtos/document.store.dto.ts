import { z } from "@infrastructure/config/zod-i18n.config";
import { documentSchema } from "../schemas/document.schema";

/**
 * Store DTO for creating a new document
 * Omits system-managed fields
 */
export const documentStoreDto = documentSchema.pick({
	file: true,
	title: true,
	metadata: true,
});

export type DocumentStoreDto = z.infer<typeof documentStoreDto>;
