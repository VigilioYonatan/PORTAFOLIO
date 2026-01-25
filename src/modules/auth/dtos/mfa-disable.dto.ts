import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "@modules/user/schemas/user.schema";

export const authMfaDisableDto = z.object({
	password: userSchema.shape.password,
	token: z.string().length(6).regex(/^\d+$/, "El token debe ser numérico"),
});

export type AuthMfaDisableDto = z.infer<typeof authMfaDisableDto>;
