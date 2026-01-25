import { z } from "@infrastructure/config/zod-i18n.config";
import { socialReactionSchema } from "../schemas/social-reaction.schema";

export const socialReactionQueryDto = z.object({
	target_id: socialReactionSchema.shape.reactable_id,
	target_type: socialReactionSchema.shape.reactable_type,
});

export type SocialReactionQueryDto = z.infer<typeof socialReactionQueryDto>;
