import { signal } from "@preact/signals";

export const isChatOpen = signal(false);

const SOUND_URL = "/sound-effect.mp3";

export function playNotificationSound() {
	// Logic: Only play if chat IS NOT open
	// However, user prompt said: "que suene ... mientras no este en el chat"
	if (isChatOpen.value) {
		return;
	}

	const audio = new Audio(SOUND_URL);
	// biome-ignore lint/suspicious/noConsole: <explanation>
	audio.play().catch((err) => console.error("Error playing sound:", err));
}

// Helper to update state
export function setChatOpen(isOpen: boolean) {
	isChatOpen.value = isOpen;
}
