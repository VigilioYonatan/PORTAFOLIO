import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "@modules/user/schemas/user.schema";

// Schema para inicio de sesión
export const authLoginDto = userSchema
	.pick({
		email: true,
		password: true,
	})
	.extend({
		remember_me: z.boolean(),
	});

export type AuthLoginDto = z.infer<typeof authLoginDto>;
