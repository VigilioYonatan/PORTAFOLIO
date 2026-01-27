import { useSignal } from "@preact/signals";

/**
 *
 * @param timer
 * @returns
 * seconds 1,2
 */
function usePressTimeOut(time = 1.5) {
	const touchTimer = useSignal<NodeJS.Timeout | null>(null);

	function handleTouchStart(cb: () => void) {
		// Iniciar un temporizador cuando el user presiona la pantalla
		const timer = setTimeout(() => {
			cb();
		}, time * 1000); //  segundos
		touchTimer.value = timer;
	}

	function handleTouchEnd() {
		clearTimeout(touchTimer.value as NodeJS.Timeout);
	}
	return { handleTouchStart, handleTouchEnd };
}

export default usePressTimeOut;
