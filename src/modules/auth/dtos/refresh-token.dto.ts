import { z } from "@infrastructure/config/zod-i18n.config";

export const authRefreshTokenDto = z.object({
	refresh_token: z.string().min(1), // Token de refresco
});

export type AuthRefreshTokenDto = z.infer<typeof authRefreshTokenDto>;
