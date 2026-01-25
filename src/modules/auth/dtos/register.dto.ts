import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "@modules/user/schemas/user.schema";

// Schema para registro de usuario
export const authRegisterDto = userSchema
	.pick({
		username: true,
		email: true,
		password: true,
	})
	.extend({
		tenant_name: z.string().min(3).max(50),
		repeat_password: userSchema.shape.password,
		phone_number: z.string().optional(),
		terms_accepted: z.boolean().refine((val) => val === true, {
			message: "Debes aceptar los términos y condiciones",
		}),
	})
	.refine((data) => data.password === data.repeat_password, {
		message: "Las contraseñas no coinciden",
		path: ["repeat_password"],
	});

export type AuthRegisterDto = z.infer<typeof authRegisterDto>;
