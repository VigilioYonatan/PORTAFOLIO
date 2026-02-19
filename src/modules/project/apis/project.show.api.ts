import { useQuery } from "@vigilio/preact-fetching";
import type { ProjectShowResponseDto } from "../dtos/project.response.dto";

export function projectShowApi(id: number | string) {
	return useQuery<ProjectShowResponseDto, { message: string }>(
		`/project/${id}`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) throw result;
			return result;
		},
	);
}
