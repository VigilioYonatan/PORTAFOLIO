import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "../schemas/user.schema";

// Store DTO: Omit system fields per rules-endpoints.md
export const userStoreDto = userSchema
	.pick({
		username: true,
		email: true,
		password: true,
		role_id: true,
		phone_number: true,
		status: true,
	})
	.extend({
		phone_number: userSchema.shape.phone_number.nullable(),
		repeat_password: userSchema.shape.password,
	})
	.refine((data) => data.password === data.repeat_password, {
		message: "Las contraseñas no coinciden",
		path: ["repeat_password"],
	});

export type UserStoreDto = z.infer<typeof userStoreDto>;
