import { createZodDto } from "nestjs-zod";
import { socialCommentReplyDto } from "./social-comment.reply.dto";

export class SocialCommentReplyClassDto extends createZodDto(
	socialCommentReplyDto,
) {}
