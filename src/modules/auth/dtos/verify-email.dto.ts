import { z } from "@infrastructure/config/zod-i18n.config";

export const authVerifyEmailDto = z.object({
	token: z.string().min(1, "El token es obligatorio"),
});

export type AuthVerifyEmailDto = z.infer<typeof authVerifyEmailDto>;
