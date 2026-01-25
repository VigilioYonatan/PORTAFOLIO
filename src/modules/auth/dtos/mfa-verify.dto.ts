import { z } from "@infrastructure/config/zod-i18n.config";

export const authMfaVerifyDto = z.object({
	token: z.string().length(6).regex(/^\d+$/, "El token debe ser numérico"),
});

export type AuthMfaVerifyDto = z.infer<typeof authMfaVerifyDto>;
