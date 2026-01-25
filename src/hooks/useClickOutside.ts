import type { RefObject } from "preact";
import { useEffect } from "preact/hooks";

/**
 * Un hook personalizado que detecta clics fuera de un elemento referenciado.
 * @param ref - La referencia (creada con `useRef`) al elemento que se desea vigilar.
 * @param handler - La función que se ejecutará cuando se detecte un clic fuera.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
	ref: RefObject<T>,
	handler: (event: Event) => void,
) {
	useEffect(() => {
		const listener = (event: Event) => {
			const el = ref.current;

			if (!el || el.contains(event.target as Node)) {
				return;
			}

			handler(event);
		};

		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [ref, handler]);
}
