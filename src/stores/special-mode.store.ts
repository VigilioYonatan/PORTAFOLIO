import { signal } from "@preact/signals";
import Cookies from "js-cookie";

export const isProtostarActive = signal(false); // Mode (Theme + Sidebar Player replacement)
export const isOverlayOpen = signal(false); // Fullscreen Overlay visibility (Protostar)
export const isNatureActive = signal(false); // Nature Mode (B&W Theme + Animal Videos)
export const isPlanetActive = signal(false); // Planet Mode (Reaper Videos)

const previousTheme = { primary: "", rgb: "" };

const resetToDefault = () => {
	const docStyle = document.documentElement.style;
	const defaultColor = "#06b6d4";
	const defaultRgb = "6, 182, 212";

	docStyle.setProperty("--primary", defaultColor);
	docStyle.setProperty("--primary-rgb", defaultRgb);

	Cookies.remove("theme-color");
	Cookies.remove("theme-name");
};

export const toggleProtostarMode = (active: boolean) => {
	// Ensure Other Modes are OFF
	if (active) {
		if (isNatureActive.value) toggleNatureMode(false);
		if (isPlanetActive.value) togglePlanetMode(false);
	}

	isProtostarActive.value = active;
	isOverlayOpen.value = active; // Initially sync overlay with mode

	const docStyle = document.documentElement.style;

	if (active) {
		// Save current theme
		previousTheme.primary = docStyle.getPropertyValue("--primary") || "#06b6d4";
		previousTheme.rgb =
			docStyle.getPropertyValue("--primary-rgb") || "6, 182, 212";

		// Change theme to Green
		docStyle.setProperty("--primary", "#22c55e");
		docStyle.setProperty("--primary-rgb", "34, 197, 94");

		// Persist to COOKIES
		Cookies.set("theme-color", "#22c55e", { expires: 365, path: "/" });
		Cookies.set("theme-name", "Protostar", { expires: 365, path: "/" });
	} else {
		// Revert to default and CLEAR STORAGE
		if (!isNatureActive.value && !isPlanetActive.value) {
			resetToDefault();
		}
		isOverlayOpen.value = false;
	}
};

export const closeOverlayOnly = () => {
	isOverlayOpen.value = false;
};

export const toggleNatureMode = (active: boolean) => {
	// Ensure Other Modes are OFF
	if (active) {
		if (isProtostarActive.value) toggleProtostarMode(false);
		if (isPlanetActive.value) togglePlanetMode(false);
	}

	isNatureActive.value = active;
	const docStyle = document.documentElement.style;

	if (active) {
		docStyle.setProperty("--primary", "#ffffff");
		docStyle.setProperty("--primary-rgb", "255, 255, 255");

		// Persist to COOKIES
		Cookies.set("theme-color", "#ffffff", { expires: 365, path: "/" });
		Cookies.set("theme-name", "Nature", { expires: 365, path: "/" });
	} else {
		if (!isPlanetActive.value && !isProtostarActive.value) {
			resetToDefault();
		}
	}
};

export const togglePlanetMode = (active: boolean) => {
	// Ensure Other Modes are OFF
	if (active) {
		if (isProtostarActive.value) toggleProtostarMode(false);
		if (isNatureActive.value) toggleNatureMode(false);
	}

	isPlanetActive.value = active;
	const docStyle = document.documentElement.style;

	if (active) {
		// Planet Mode Theme: Purple
		docStyle.setProperty("--primary", "#a855f7");
		docStyle.setProperty("--primary-rgb", "168, 85, 247");

		// Persist to COOKIES
		Cookies.set("theme-color", "#a855f7", { expires: 365, path: "/" });
		Cookies.set("theme-name", "Planet", { expires: 365, path: "/" });
	} else {
		if (!isNatureActive.value && !isProtostarActive.value) {
			resetToDefault();
		}
	}
};
