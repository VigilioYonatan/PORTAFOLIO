import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { technologySchema } from "../schemas/technology.schema";

export const technologyQueryDto = technologySchema
	.pick({
		category: true,
	})
	.partial()
	.extend(querySchema.shape);

export type TechnologyQueryDto = z.infer<typeof technologyQueryDto>;
