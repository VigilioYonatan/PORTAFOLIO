import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "@modules/user/schemas/user.schema";

export const authResetPasswordDto = z
	.object({
		token: z.string().min(1), // Token de recuperación
		new_password: userSchema.shape.password, // Nueva contraseña
		repeat_password: userSchema.shape.password,
	})
	.refine((data) => data.new_password === data.repeat_password, {
		message: "Las contraseñas no coinciden", // TODO: i18n
		path: ["repeat_password"],
	});

export type AuthResetPasswordDto = z.infer<typeof authResetPasswordDto>;
