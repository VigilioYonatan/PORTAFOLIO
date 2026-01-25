import { createZodDto } from "nestjs-zod";
import {
	socialCommentDestroyResponseDto,
	socialCommentIndexResponseDto,
	socialCommentReplyResponseDto,
	socialCommentResponseDto,
	socialCommentStoreResponseDto,
	socialCommentUpdateResponseDto,
	socialReactionCountResponseDto,
	socialReactionToggleResponseDto,
} from "./social.response.dto";

export class SocialCommentIndexResponseClassDto extends createZodDto(
	socialCommentIndexResponseDto,
) {}
export class SocialCommentStoreResponseClassDto extends createZodDto(
	socialCommentStoreResponseDto,
) {}
export class SocialCommentReplyResponseClassDto extends createZodDto(
	socialCommentReplyResponseDto,
) {}
export class SocialCommentUpdateResponseClassDto extends createZodDto(
	socialCommentUpdateResponseDto,
) {}
export class SocialCommentDestroyResponseClassDto extends createZodDto(
	socialCommentDestroyResponseDto,
) {}
export class SocialCommentResponseClassDto extends createZodDto(
	socialCommentResponseDto,
) {}

export class SocialReactionCountResponseClassDto extends createZodDto(
	socialReactionCountResponseDto,
) {}
export class SocialReactionToggleResponseClassDto extends createZodDto(
	socialReactionToggleResponseDto,
) {}
