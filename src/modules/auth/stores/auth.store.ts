import { signal } from "@preact/signals";

interface UserAuth {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	role_id: number;
}

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
