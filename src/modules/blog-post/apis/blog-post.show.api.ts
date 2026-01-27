import { useQuery } from "@vigilio/preact-fetching";
import type { BlogPostShowResponseDto } from "../dtos/blog-post.response.dto";

export function blogPostShowApi(id: number | null) {
	return useQuery<BlogPostShowResponseDto, unknown>(
		`/blog-post/${id}`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
		{
			skipFetching: !id,
		},
	);
}
