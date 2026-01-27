import { createZodDto } from "nestjs-zod";
import { socialReactionSchema } from "../schemas/social-reaction.schema";
import { socialReactionStoreDto } from "./social-reaction.store.dto";

export class SocialReactionStoreClassDto extends createZodDto(
	socialReactionStoreDto,
) {}
export class SocialReactionResponseClassDto extends createZodDto(
	socialReactionSchema,
) {}
