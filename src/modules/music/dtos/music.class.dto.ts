import { createZodDto } from "nestjs-zod";
import { musicTrackSchema } from "../schemas/music.schema";
import { musicQueryDto } from "./music.query.dto";
import { musicResponseDto } from "./music.response.dto";
import { musicStoreDto } from "./music.store.dto";
import { musicUpdateDto } from "./music.update.dto";

export class MusicStoreClassDto extends createZodDto(musicStoreDto) {}
export class MusicUpdateClassDto extends createZodDto(musicUpdateDto) {}
export class MusicQueryClassDto extends createZodDto(musicQueryDto) {}
export class MusicResponseClassDto extends createZodDto(musicTrackSchema) {}
export class MusicIndexResponseClassDto extends createZodDto(
	musicResponseDto,
) {}
