import type { UserAuth } from "@modules/user/schemas/user.schema";
import { signal } from "@preact/signals";

const user = signal<UserAuth | null>(
	typeof window !== "undefined" ? window.locals.user : null,
);

export function useAuthStore() {
	function onUserUpdate(new_user: Partial<UserAuth>) {
		if (user.value) {
			user.value = { ...user.value, ...new_user };
		}
	}

	return {
		state: user,
		methods: {
			onUserUpdate,
		},
	};
}
