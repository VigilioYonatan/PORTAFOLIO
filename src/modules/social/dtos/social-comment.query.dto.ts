import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { socialCommentSchema } from "../schemas/social-comment.schema";

export const socialCommentQueryDto = socialCommentSchema
	.pick({
		commentable_id: true,
		commentable_type: true,
	})
	.partial()
	.extend(querySchema.shape);

export type SocialCommentQueryDto = z.infer<typeof socialCommentQueryDto>;
