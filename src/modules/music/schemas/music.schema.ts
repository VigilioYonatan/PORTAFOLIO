import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const musicTrackSchema = z.object({
	id: z.number().int().positive(),
	title: z.string().min(1).max(200),
	artist: z.string().min(1).max(100),
	duration_seconds: z.number().int().nonnegative(),
	sort_order: z.number().int(), // Removed default
	is_featured: z.boolean(), // Removed default
	is_public: z.boolean(), // Removed default
	audio_file: z.array(filesSchema()).min(1),
	cover: z
		.array(filesSchema(UPLOAD_CONFIG.music_track.cover!.dimensions))
		.nullable(), // Fixed: Nullable, removed default([]), removed optional
	tenant_id: z.number().int().positive(),
	...timeStampSchema.shape,
});

export type MusicTrackSchema = z.infer<typeof musicTrackSchema>;
