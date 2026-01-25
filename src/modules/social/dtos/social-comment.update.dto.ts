import { z } from "@infrastructure/config/zod-i18n.config";
import { socialCommentSchema } from "../schemas/social-comment.schema";

export const socialCommentUpdateDto = socialCommentSchema.pick({
	is_visible: true,
});

export type SocialCommentUpdateDto = z.infer<typeof socialCommentUpdateDto>;
