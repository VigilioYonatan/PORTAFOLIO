import { z } from "@infrastructure/config/zod-i18n.config";
import { socialReactionSchema } from "../schemas/social-reaction.schema";

export const socialReactionStoreSchema = socialReactionSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type SocialReactionStoreDto = z.infer<typeof socialReactionStoreSchema>;
