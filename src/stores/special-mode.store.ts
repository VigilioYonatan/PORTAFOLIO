import { signal } from "@preact/signals";

export const isProtostarActive = signal(false); // Mode (Theme + Sidebar Player replacement)
export const isOverlayOpen = signal(false); // Fullscreen Overlay visibility (Protostar)
export const isNatureActive = signal(false); // Nature Mode (B&W Theme + Animal Videos)
export const isPlanetActive = signal(false); // Planet Mode (Reaper Videos)

const previousTheme = { primary: "", rgb: "" };

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
	} else {
		// Revert to saved theme ONLY if we are NOT switching to another special mode
		if (!isNatureActive.value && !isPlanetActive.value) {
			docStyle.setProperty("--primary", previousTheme.primary);
			docStyle.setProperty("--primary-rgb", previousTheme.rgb);
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
		if (!previousTheme.primary) {
			previousTheme.primary =
				docStyle.getPropertyValue("--primary") || "#06b6d4";
			previousTheme.rgb =
				docStyle.getPropertyValue("--primary-rgb") || "6, 182, 212";
		}

		docStyle.setProperty("--primary", "#ffffff");
		docStyle.setProperty("--primary-rgb", "255, 255, 255");
	} else {
		if (!isPlanetActive.value && !isProtostarActive.value) {
			docStyle.setProperty("--primary", previousTheme.primary || "#06b6d4");
			docStyle.setProperty("--primary-rgb", previousTheme.rgb || "6, 182, 212");
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
		if (!previousTheme.primary) {
			previousTheme.primary =
				docStyle.getPropertyValue("--primary") || "#06b6d4";
			previousTheme.rgb =
				docStyle.getPropertyValue("--primary-rgb") || "6, 182, 212";
		}

		// Planet Mode Theme: Maybe a deep Purple or just keep consistent
		docStyle.setProperty("--primary", "#a855f7"); // Purple
		docStyle.setProperty("--primary-rgb", "168, 85, 247");
	} else {
		if (!isNatureActive.value && !isProtostarActive.value) {
			docStyle.setProperty("--primary", previousTheme.primary || "#06b6d4");
			docStyle.setProperty("--primary-rgb", previousTheme.rgb || "6, 182, 212");
		}
	}
};
