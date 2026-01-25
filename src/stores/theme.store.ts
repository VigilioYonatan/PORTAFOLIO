import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

type ThemeMode = "light" | "dark" | "default";
const THEME_KEY = "theme";
function getThemeLocalStorage() {
	let themeMode: ThemeMode = "default";
	if (localStorage.getItem(THEME_KEY)) {
		themeMode = localStorage.getItem(THEME_KEY) as ThemeMode;
	}

	return themeMode;
}
const theme = signal(getThemeLocalStorage());
export function useThemeStore() {
	function changeTheme(them: ThemeMode) {
		theme.value = them;
	}
	function changeThemeMode(them: ThemeMode) {
		if (them === theme.value) return;
		if (them === "default") {
			localStorage.removeItem(THEME_KEY);
			changeTheme(them);
			return;
		}
		localStorage.setItem(THEME_KEY, them);
		changeTheme(them);
	}
	function lightModeElement() {
		document.documentElement.classList.remove("dark");
		document.documentElement.classList.add("light");
	}
	function darkModeElement() {
		document.documentElement.classList.remove("light");
		document.documentElement.classList.add("dark");
	}

	useEffect(() => {
		if (!window.location.pathname.startsWith("/dashboard")) {
			lightModeElement();
			localStorage.removeItem(THEME_KEY);
			return;
		}

		if (theme.value === "light") {
			lightModeElement();
			return;
		}

		if (theme.value === "default") {
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				darkModeElement();
				return;
			}
			lightModeElement();
			return;
		}
		darkModeElement();
	}, [theme.value]);

	return {
		state: theme.value,
		methods: {
			changeThemeMode,
		},
	};
}

export default useThemeStore;
