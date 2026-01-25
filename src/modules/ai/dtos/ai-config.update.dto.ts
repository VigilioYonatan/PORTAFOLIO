import { z } from "@infrastructure/config/zod-i18n.config";
import { aiConfigSchema } from "../schemas/ai-config.schema";

export const aiConfigUpdateDto = aiConfigSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type AiConfigUpdateDto = z.infer<typeof aiConfigUpdateDto>;
