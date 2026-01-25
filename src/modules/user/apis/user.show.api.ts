import { useQuery } from "@vigilio/preact-fetching";
import type { UserResponseDto } from "../dtos/user.response.dto";
import type { UserShowSchema } from "../schemas/user.schema";

/**
 * userShow - /api/v1/users/:id
 * @method GET
 */
export function userShowApi(id: number) {
	return useQuery<UserResponseDto, UserShowApiError>(
		`/users/${id}`,
		async (url) => {
			const response = await fetch(`/api/v1${url}`);
			const result = await response.json();
			if (!response.ok) {
				throw result;
			}
			return result;
		},
	);
}

export interface UserShowApiResult {
	success: true;
	user: UserShowSchema;
}

export interface UserShowApiError {
	success: false;
	message: string;
}
