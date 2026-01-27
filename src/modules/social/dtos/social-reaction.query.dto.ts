import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { socialReactionSchema } from "../schemas/social-reaction.schema";

export const socialReactionQueryDto = socialReactionSchema
	.pick({
		reactable_id: true,
		reactable_type: true,
	})
	.extend(querySchema.shape);

export type SocialReactionQueryDto = z.infer<typeof socialReactionQueryDto>;
