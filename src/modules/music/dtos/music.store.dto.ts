import { z } from "@infrastructure/config/zod-i18n.config";
import { musicTrackSchema } from "../schemas/music.schema";

export const musicStoreDto = musicTrackSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type MusicStoreDto = z.infer<typeof musicStoreDto>;
