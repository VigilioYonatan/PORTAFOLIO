import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { socialCommentSchema } from "../schemas/social-comment.schema";
import { socialReactionSchema } from "../schemas/social-reaction.schema";

// --- Comments ---

export const socialCommentIndexResponseDto =
	createPaginatorSchema(socialCommentSchema);
export type SocialCommentIndexResponseDto = z.infer<
	typeof socialCommentIndexResponseDto
>;

export const socialCommentStoreResponseDto = z.object({
	success: z.literal(true),
	comment: socialCommentSchema,
});
export type SocialCommentStoreResponseDto = z.infer<
	typeof socialCommentStoreResponseDto
>;

export const socialCommentReplyResponseDto = z.object({
	success: z.literal(true),
	comment: socialCommentSchema,
});
export type SocialCommentReplyResponseDto = z.infer<
	typeof socialCommentReplyResponseDto
>;

export const socialCommentUpdateResponseDto = z.object({
	success: z.literal(true),
	comment: socialCommentSchema,
});
export type SocialCommentUpdateResponseDto = z.infer<
	typeof socialCommentUpdateResponseDto
>;

export const socialCommentDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type SocialCommentDestroyResponseDto = z.infer<
	typeof socialCommentDestroyResponseDto
>;

// --- Reactions ---

export const socialReactionCountResponseDto = z.record(
	z.string(),
	z.number().int(),
);
export type SocialReactionCountResponseDto = z.infer<
	typeof socialReactionCountResponseDto
>;

export const socialReactionToggleResponseDto = z.object({
	action: z.enum(["ADDED", "REMOVED"]),
	reaction: socialReactionSchema.optional(),
});
export type SocialReactionToggleResponseDto = z.infer<
	typeof socialReactionToggleResponseDto
>;

// --- Generic ---

export const socialCommentResponseDto = socialCommentSchema;
export type SocialCommentResponseDto = z.infer<typeof socialCommentResponseDto>;
