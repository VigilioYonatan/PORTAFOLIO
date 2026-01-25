import { signal } from "@preact/signals";

export const isChatOpen = signal(false);

export function toggleChat() {
    isChatOpen.value = !isChatOpen.value;
}
