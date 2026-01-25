import { useSignal } from "@preact/signals";
import { Moon, Sun } from "lucide-preact";
import { useEffect } from "preact/hooks";

export default function ThemeSelector() {
	const theme = useSignal<"light" | "dark" | null>(null);

	useEffect(() => {
		// Initialize theme from document class
		const isDark = document.documentElement.classList.contains("dark");
		theme.value = isDark ? "dark" : "light";
	}, []);

	function toggleTheme() {
		const newTheme = theme.value === "dark" ? "light" : "dark";
		theme.value = newTheme;

		if (newTheme === "dark") {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}

	if (!theme.value) return null;

	return (
		<button
			type="button"
			onClick={toggleTheme}
			class="p-2 rounded-full border border-border text-foreground hover:bg-accent transition-all duration-300 group"
			aria-label={`Switch to ${theme.value === "dark" ? "light" : "dark"} mode`}
		>
			{theme.value === "dark" ? (
				<Sun class="w-4 h-4 group-hover:rotate-45 transition-transform" />
			) : (
				<Moon class="w-4 h-4 group-hover:-rotate-12 transition-transform" />
			)}
		</button>
	);
}
