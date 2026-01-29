import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";

export const aiInsightQueryDto = querySchema;

export type AiInsightQueryDto = z.infer<typeof aiInsightQueryDto>;
