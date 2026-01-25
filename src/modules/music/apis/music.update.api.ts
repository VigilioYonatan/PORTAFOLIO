import { useMutation } from "@vigilio/preact-fetching";
import type { MusicTrackUpdateResponseDto } from "../dtos/music.response.dto";
import type { MusicUpdateDto } from "../dtos/music.update.dto";

export interface MusicTrackUpdateApiError {
	success: false;
	message: string;
	body: keyof MusicUpdateDto;
}

/**
 * musicTrackUpdate - /api/v1/music/:id
 * @method PUT
 */
export function musicTrackUpdateApi(id: number) {
	return useMutation<
		MusicTrackUpdateResponseDto,
		MusicUpdateDto,
		MusicTrackUpdateApiError
	>(`/music/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PUT",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}
