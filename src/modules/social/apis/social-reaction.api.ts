import { useMutation, useQuery } from "@vigilio/preact-fetching";
import type {
	SocialReactionCountResponseDto,
	SocialReactionToggleResponseDto,
} from "../dtos/social.response.dto";
import type { SocialReactionStoreDto } from "../dtos/social-reaction.store.dto";

export function socialReactionToggleApi() {
	return useMutation<
		SocialReactionToggleResponseDto,
		SocialReactionStoreDto,
		unknown
	>("/social/reactions", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const result = await response.json();
		if (!response.ok) throw result;
		return result;
	});
}

export function socialReactionsSummaryApi(
	target_id = "global",
	target_type = "system",
) {
	return useQuery<SocialReactionCountResponseDto, unknown>(
		`/social/reactions?target_id=${target_id}&target_type=${target_type}`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
