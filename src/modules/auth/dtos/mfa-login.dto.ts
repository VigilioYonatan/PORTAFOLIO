import { z } from "@infrastructure/config/zod-i18n.config";

export const authMfaLoginDto = z.object({
	temp_token: z.string(),
	mfa_code: z.string().length(6),
});

export type AuthMfaLoginDto = z.infer<typeof authMfaLoginDto>;
