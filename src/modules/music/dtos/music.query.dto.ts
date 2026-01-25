import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { musicTrackSchema } from "../schemas/music.schema";

export const musicQueryDto = musicTrackSchema
	.pick({
		is_featured: true,
		is_public: true,
	})
	.partial()
	.extend(querySchema.shape);

export type MusicQueryDto = z.infer<typeof musicQueryDto>;
