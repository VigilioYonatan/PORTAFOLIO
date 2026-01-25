import { signal, useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export function useTypingEffect(
	text: string,
	speed = 50,
	startDelay = 0,
	loop = false,
) {
	const displayedText = useSignal("");
	const isTyping = useSignal(true);
	const isDone = useSignal(false);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		let currentIndex = 0;

		const typeChar = () => {
			if (currentIndex < text.length) {
				displayedText.value = text.slice(0, currentIndex + 1);
				currentIndex++;
				timeoutId = setTimeout(typeChar, speed + Math.random() * 20); // Add variance
			} else {
				isTyping.value = false;
				isDone.value = true;
				if (loop) {
					timeoutId = setTimeout(() => {
						displayedText.value = "";
						currentIndex = 0;
						isTyping.value = true;
						typeChar();
					}, 2000); // Wait before looping
				}
			}
		};

		timeoutId = setTimeout(typeChar, startDelay);

		return () => clearTimeout(timeoutId);
	}, [text, speed, startDelay, loop]);

	return { displayedText, isTyping, isDone };
}
