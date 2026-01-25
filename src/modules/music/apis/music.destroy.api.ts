import { useMutation } from "@vigilio/preact-fetching";
import type { MusicTrackDestroyResponseDto } from "../dtos/music.response.dto";

export interface MusicTrackDestroyApiError {
	success: false;
	message: string;
}

/**
 * musicTrackDestroy - /api/v1/music/:id
 * @method DELETE
 */
export function musicTrackDestroyApi() {
	return useMutation<
		MusicTrackDestroyResponseDto,
		number,
		MusicTrackDestroyApiError
	>("/music", async (url, id) => {
		const response = await fetch(`/api/v1${url}/${id}`, {
			method: "DELETE",
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
