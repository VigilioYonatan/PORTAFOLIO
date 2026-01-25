import { z } from "@infrastructure/config/zod-i18n.config";

export const uploadPresignedUrlDto = z.object({
	fileName: z.string().min(1),
	fileType: z.string().optional(),
});
export type UploadPresignedUrlDto = z.infer<typeof uploadPresignedUrlDto>;

export const uploadMultipartCreateDto = z.object({
	filename: z.string().min(1),
	type: z.string().min(1),
});
export type UploadMultipartCreateDto = z.infer<typeof uploadMultipartCreateDto>;

export const uploadMultipartSignPartDto = z.object({
	key: z.string().min(1),
	uploadId: z.string().min(1),
	partNumber: z.number().int().positive(),
});
export type UploadMultipartSignPartDto = z.infer<
	typeof uploadMultipartSignPartDto
>;

export const completedPartSchema = z.object({
	ETag: z.string().min(1),
	PartNumber: z.number().int().positive(),
});

export const uploadMultipartCompleteDto = z.object({
	key: z.string().min(1),
	uploadId: z.string().min(1),
	parts: z.array(completedPartSchema),
});
export type UploadMultipartCompleteDto = z.infer<
	typeof uploadMultipartCompleteDto
>;

export const uploadDeleteDto = z.object({
	key: z.union([z.string(), z.array(z.string())]),
});
export type UploadDeleteDto = z.infer<typeof uploadDeleteDto>;
