import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "@modules/user/schemas/user.schema";

export const authForgotPasswordDto = userSchema.pick({
	email: true,
});

export type AuthForgotPasswordDto = z.infer<typeof authForgotPasswordDto>;
