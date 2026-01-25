import { z } from "@infrastructure/config/zod-i18n.config";

export const authImpersonateDto = z.object({
	reason: z.string().min(5).max(200),
});

export type AuthImpersonateDto = z.infer<typeof authImpersonateDto>;
