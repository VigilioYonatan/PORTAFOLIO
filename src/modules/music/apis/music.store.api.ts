import { useMutation } from "@vigilio/preact-fetching";
import type { MusicTrackStoreResponseDto } from "../dtos/music.response.dto";
import type { MusicStoreDto } from "../dtos/music.store.dto";

export interface MusicTrackStoreApiError {
	success: false;
	message: string;
	body: keyof MusicStoreDto;
}

/**
 * musicTrackStore - /api/v1/music
 * @method POST
 */
export function musicTrackStoreApi() {
	return useMutation<
		MusicTrackStoreResponseDto,
		MusicStoreDto,
		MusicTrackStoreApiError
	>("/music", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
