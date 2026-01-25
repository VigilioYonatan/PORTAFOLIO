import { createZodDto } from "nestjs-zod";
import { socialCommentUpdateDto } from "./social-comment.update.dto";

export class SocialCommentUpdateClassDto extends createZodDto(
	socialCommentUpdateDto,
) {}
