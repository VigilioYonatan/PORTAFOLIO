import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "@modules/user/schemas/user.schema";

// Schema para inicio de sesión
export const authLoginDto = z.object({
	email: z.string().email(),
	password: z.string().min(1),
	remember_me: z.boolean().optional().default(false),
});

export type AuthLoginDto = z.infer<typeof authLoginDto>;
