import { createZodDto } from "nestjs-zod";
import {
	musicTrackDestroyResponseDto,
	musicTrackIndexResponseDto,
	musicTrackShowResponseDto,
	musicTrackStoreResponseDto,
	musicTrackUpdateResponseDto,
} from "./music.response.dto";

export class MusicTrackIndexResponseClassDto extends createZodDto(
	musicTrackIndexResponseDto,
) {}
export class MusicTrackStoreResponseClassDto extends createZodDto(
	musicTrackStoreResponseDto,
) {}
export class MusicTrackShowResponseClassDto extends createZodDto(
	musicTrackShowResponseDto,
) {}
export class MusicTrackUpdateResponseClassDto extends createZodDto(
	musicTrackUpdateResponseDto,
) {}
export class MusicTrackDestroyResponseClassDto extends createZodDto(
	musicTrackDestroyResponseDto,
) {}
