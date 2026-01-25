import { createZodDto } from "nestjs-zod";
import { socialCommentQueryDto } from "./social-comment.query.dto";

export class SocialCommentQueryClassDto extends createZodDto(
	socialCommentQueryDto,
) {}
