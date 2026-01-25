import type { MusicStoreDto } from "../dtos/music.store.dto";
import type { MusicTrackSchema } from "../schemas/music.schema";

export class MusicFactory {
	static createDto(overrides: Partial<MusicStoreDto> = {}): MusicStoreDto {
		const timestamp = Date.now();
		return {
			title: `Track_${timestamp}`,
			artist: `Artist_${timestamp}`,
			duration_seconds: 180,
			sort_order: 0,
			is_featured: false,
			is_public: true,
			audio_file: [
				{
					key: `music/track_${timestamp}.mp3`,
					name: `track_${timestamp}.mp3`,
					original_name: `track_${timestamp}.mp3`,
					size: 5000000,
					mimetype: "audio/mpeg",
				},
			],
			cover: [],
			...overrides,
		};
	}

	static createSchema(
		overrides: Partial<MusicTrackSchema> = {},
	): MusicTrackSchema {
		const timestamp = Date.now();
		return {
			id: Math.floor(Math.random() * 10000) + 1,
			tenant_id: 1,
			title: `Track_${timestamp}`,
			artist: `Artist_${timestamp}`,
			duration_seconds: 180,
			sort_order: 0,
			is_featured: false,
			is_public: true,
			audio_file: [
				{
					key: `music/track_${timestamp}.mp3`,
					name: `track_${timestamp}.mp3`,
					original_name: `track_${timestamp}.mp3`,
					size: 5000000,
					mimetype: "audio/mpeg",
				},
			],
			cover: [],
			created_at: new Date(),
			updated_at: new Date(),
			...overrides,
		};
	}
}
