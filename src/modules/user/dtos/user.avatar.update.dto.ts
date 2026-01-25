import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "../schemas/user.schema";

// Avatar Update DTO: Strictly pick avatar field
export const userAvatarUpdateDto = userSchema.pick({
	avatar: true,
});

export type UserAvatarUpdateDto = z.infer<typeof userAvatarUpdateDto>;
