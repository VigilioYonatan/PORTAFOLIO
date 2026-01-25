import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "../schemas/user.schema";

// Change Password DTO: { current_password, new_password, confirm_password }
export const userChangePasswordDto = z
	.object({
		current_password: z.string().min(1),
		new_password: userSchema.shape.password,
		confirm_password: z.string().min(1),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "Las contraseñas no coinciden",
		path: ["confirm_password"],
	});

export type UserChangePasswordDto = z.infer<typeof userChangePasswordDto>;
