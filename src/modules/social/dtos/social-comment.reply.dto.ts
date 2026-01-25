import { z } from "@infrastructure/config/zod-i18n.config";
import { socialCommentSchema } from "../schemas/social-comment.schema";

// Requirement 19.4: body: Pick<SocialComment, "content">
// We use 'content' from schema, but semantic is reply content.
export const socialCommentReplyDto = socialCommentSchema.pick({
	content: true,
});

export type SocialCommentReplyDto = z.infer<typeof socialCommentReplyDto>;
