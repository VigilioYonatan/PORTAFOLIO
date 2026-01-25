import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "../schemas/user.schema";

// Update DTO: Strictly pick allowed Admin update fields
export const userUpdateDto = userSchema.pick({
	username: true,
	phone_number: true,
	role_id: true,
	status: true,
	is_mfa_enabled: true,
});

export type UserUpdateDto = z.infer<typeof userUpdateDto>;
