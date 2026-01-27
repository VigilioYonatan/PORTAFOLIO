import { useQuery } from "@vigilio/preact-fetching";
import type { BlogPostShowResponseDto } from "../dtos/blog-post.response.dto";

export function blogPostShowApi(slug: string) {
	return useQuery<BlogPostShowResponseDto, unknown>(
		`/blog-post/${slug}`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
