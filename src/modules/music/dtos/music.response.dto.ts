import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { musicTrackSchema } from "../schemas/music.schema";

// --- Index / List ---
export const musicTrackIndexResponseDto =
	createPaginatorSchema(musicTrackSchema);
export type MusicTrackIndexResponseDto = z.infer<
	typeof musicTrackIndexResponseDto
>;

// --- Store ---
export const musicTrackStoreResponseDto = z.object({
	success: z.literal(true),
	music: musicTrackSchema,
});
export type MusicTrackStoreResponseDto = z.infer<
	typeof musicTrackStoreResponseDto
>;

// --- Show ---
export const musicTrackShowResponseDto = z.object({
	success: z.literal(true),
	music: musicTrackSchema,
});
export type MusicTrackShowResponseDto = z.infer<
	typeof musicTrackShowResponseDto
>;

// --- Update ---
export const musicTrackUpdateResponseDto = z.object({
	success: z.literal(true),
	music: musicTrackSchema,
});
export type MusicTrackUpdateResponseDto = z.infer<
	typeof musicTrackUpdateResponseDto
>;

// --- Destroy ---
export const musicTrackDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type MusicTrackDestroyResponseDto = z.infer<
	typeof musicTrackDestroyResponseDto
>;

// --- Generic ---
export const musicResponseDto = z.object({
	success: z.literal(true),
	music: musicTrackSchema,
});
export type MusicResponseDto = z.infer<typeof musicResponseDto>;
export type MusicResponseApi = MusicTrackIndexResponseDto; // Alias for backward compatibility if needed
