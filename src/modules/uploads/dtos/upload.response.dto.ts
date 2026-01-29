import { z } from "@infrastructure/config/zod-i18n.config";
import { filesSchema } from "../schemas/upload.schema";

export const uploadProviderResponseDto = z.object({
	success: z.literal(true),
	data: z.object({
		provider: z.string(),
	}),
});
export type UploadProviderResponseDto = z.infer<
	typeof uploadProviderResponseDto
>;

export const uploadResponseDto = z.object({
	success: z.boolean(),
	data: z.array(filesSchema()),
});
export type UploadResponseDto = z.infer<typeof uploadResponseDto>;

export const uploadPresignedUrlResponseDto = z.object({
	success: z.literal(true),
	data: z.object({
		uploadUrl: z.string(),
		key: z.string(),
	}),
});
export type UploadPresignedUrlResponseDto = z.infer<
	typeof uploadPresignedUrlResponseDto
>;

export const uploadMultipartInitResponseDto = z.object({
	success: z.literal(true),
	data: z.object({
		uploadId: z.string(),
		key: z.string(),
	}),
});
export type UploadMultipartInitResponseDto = z.infer<
	typeof uploadMultipartInitResponseDto
>;

export const uploadSignedPartResponseDto = z.object({
	success: z.literal(true),
	data: z.object({
		url: z.string(),
	}),
});
export type UploadSignedPartResponseDto = z.infer<
	typeof uploadSignedPartResponseDto
>;

export const uploadMultipartCompleteResponseDto = z.object({
	success: z.literal(true),
	data: z.object({
		location: z.string(),
	}),
});
export type UploadMultipartCompleteResponseDto = z.infer<
	typeof uploadMultipartCompleteResponseDto
>;

export const uploadDeleteResponseDto = z.object({
	success: z.literal(true),
	data: z.object({
		message: z.string(),
		key: z.union([z.string(), z.array(z.string())]),
	}),
});
export type UploadDeleteResponseDto = z.infer<typeof uploadDeleteResponseDto>;

export const uploadFormidableResponseDto = z.object({
	success: z.boolean(),
	data: z.array(filesSchema()),
	fields: z.any(), // Fields from formidable can be complex, verify if strict typing is needed or any is acceptable for now
});
export type UploadFormidableResponseDto = z.infer<
	typeof uploadFormidableResponseDto
>;
