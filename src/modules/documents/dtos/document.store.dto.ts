import { z } from "@infrastructure/config/zod-i18n.config";
import { documentSchema } from "../schemas/document.schema";

/**
 * Store DTO for creating a new document
 * Omits system-managed fields
 */
export const documentStoreDto = documentSchema.omit({
	id: true,
	tenant_id: true,
	user_id: true,
	created_at: true,
	updated_at: true,
	chunk_count: true,
	is_indexed: true,
	status: true,
	processed_at: true,
});

export type DocumentStoreDto = z.infer<typeof documentStoreDto>;
