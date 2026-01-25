import { z } from "@infrastructure/config/zod-i18n.config";
import { socialCommentSchema } from "../schemas/social-comment.schema";

export const socialCommentStoreDto = socialCommentSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
	is_visible: true,
	reply: true,
	user_id: true,
});

export type SocialCommentStoreDto = z.infer<typeof socialCommentStoreDto>;
