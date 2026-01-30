import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { openSourceSchema } from "../schemas/open-source.schema";

export const openSourceQueryDto = openSourceSchema
	.pick({
		name: true,
		category: true,
		is_visible: true,
		language: true,
	})
	.partial()
	.extend(querySchema.shape);

export type OpenSourceQueryDto = z.infer<typeof openSourceQueryDto>;
