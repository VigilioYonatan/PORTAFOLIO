import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { aiInsightSchema } from "../schemas/ai-insight.schema";

export const aiInsightQueryDto = aiInsightSchema
	.pick({})
	.extend(querySchema.shape);

export type AiInsightQueryDto = z.infer<typeof aiInsightQueryDto>;
