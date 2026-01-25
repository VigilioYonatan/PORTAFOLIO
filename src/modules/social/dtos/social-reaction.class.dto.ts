import { createZodDto } from "nestjs-zod";
import { socialReactionSchema } from "../schemas/social-reaction.schema";
import { socialReactionStoreSchema } from "./social-reaction.store.dto";

export class SocialReactionStoreClassDto extends createZodDto(
	socialReactionStoreSchema,
) {}
export class SocialReactionResponseClassDto extends createZodDto(
	socialReactionSchema,
) {}
