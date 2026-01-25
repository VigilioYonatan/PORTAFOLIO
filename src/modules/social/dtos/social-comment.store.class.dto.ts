import { createZodDto } from "nestjs-zod";
import { socialCommentStoreDto } from "./social-comment.store.dto";

export class SocialCommentStoreClassDto extends createZodDto(
	socialCommentStoreDto,
) {}
