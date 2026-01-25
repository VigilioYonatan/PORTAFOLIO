import { createZodDto } from "nestjs-zod";
import { socialReactionQueryDto } from "./social-reaction.query.dto";

export class SocialReactionQueryClassDto extends createZodDto(
	socialReactionQueryDto,
) {}
