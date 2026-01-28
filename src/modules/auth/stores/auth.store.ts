import { signal } from "@preact/signals";
import type { UserAuth as UserAuthSchema } from "@modules/user/schemas/user.schema";

type UserAuth = Pick<UserAuthSchema, "id" | "username" | "email" | "avatar" | "role_id">;

interface AuthState {
	user: UserAuth | null;
	isAuthenticated: boolean;
	token: string | null;
}

const state = signal<AuthState>({
	user: null,
	isAuthenticated: false,
	token: null,
});

function authStore() {
	function onLogin(user: UserAuth, token: string) {
		state.value = {
			user,
			isAuthenticated: true,
			token,
		};
	}

	function onLogout() {
		state.value = {
			user: null,
			isAuthenticated: false,
			token: null,
		};
	}

	return {
		state: state.value,
		methods: {
			onLogin,
			onLogout,
		},
	};
}

export default authStore;
