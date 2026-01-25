import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "../schemas/user.schema";

// Profile Update DTO: Strictly pick allowed fields for self-update
export const userProfileUpdateDto = userSchema
	.pick({
		username: true,
		email: true,
		avatar: true,
		phone_number: true,
	})
	.extend({
		password: z.string().optional(),
	})
	.partial();

export type UserProfileUpdateDto = z.infer<typeof userProfileUpdateDto>;
