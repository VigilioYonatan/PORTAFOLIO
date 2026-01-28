import { useQuery } from "@vigilio/preact-fetching";
import type { BlogPostShowResponseDto } from "../dtos/blog-post.response.dto";

export function blogPostShowApi(idOrSlug: number | string | null) {
	return useQuery<BlogPostShowResponseDto, unknown>(
		`/blog-post/${idOrSlug}`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
		{
			skipFetching: !idOrSlug,
		},
	);
}
