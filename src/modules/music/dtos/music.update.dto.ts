import { z } from "@infrastructure/config/zod-i18n.config";
import { musicStoreDto } from "./music.store.dto";

export const musicUpdateDto = musicStoreDto;

export type MusicUpdateDto = z.infer<typeof musicUpdateDto>;
