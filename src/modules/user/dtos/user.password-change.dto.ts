import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "../schemas/user.schema";

// Password change DTO
export const userPasswordChangeDto = z
	.object({
		current_password: userSchema.shape.password,
		new_password: userSchema.shape.password,
		confirm_password: userSchema.shape.password,
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "Las contraseñas no coinciden",
		path: ["confirm_password"],
	})
	.refine((data) => data.new_password !== data.current_password, {
		message: "La nueva contraseña debe ser diferente a la actual",
		path: ["new_password"],
	});

export type UserPasswordChangeDto = z.infer<typeof userPasswordChangeDto>;
