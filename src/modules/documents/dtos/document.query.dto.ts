import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { documentSchema } from "../schemas/document.schema";

/**
 * Query DTO for filtering and paginating documents
 */
export const documentQueryDto = documentSchema
	.pick({
		status: true,
		is_indexed: true,
	})
	.partial()
	.extend(querySchema.shape);

export type DocumentQueryDto = z.infer<typeof documentQueryDto>;
