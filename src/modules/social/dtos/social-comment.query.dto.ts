import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { socialCommentSchema } from "../schemas/social-comment.schema";

export const socialCommentQueryDto = z
	.object({
		target_id: z.coerce.number().int().positive().optional(),
		target_type: socialCommentSchema.shape.commentable_type.optional(),
	})
	.extend(querySchema.shape);

export type SocialCommentQueryDto = z.infer<typeof socialCommentQueryDto>;
