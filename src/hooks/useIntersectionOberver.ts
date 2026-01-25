import { useSignal } from "@preact/signals";
import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

interface IntersectionObserverOptions {
	threshold?: number; // Porcentaje de visibilidad (0 a 1) para considerar el elemento "visible"
	triggerOnce?: boolean; // Si solo debe dispararse una vez
	root?: Element | null; // Elemento raíz (por defecto, el viewport)
	rootMargin?: string; // Margen del raíz (por ejemplo, "0px 0px 10px 0px")
}

interface IntersectionObserverResult {
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	ref: RefObject<any | null>; // Referencia al elemento
	inView: boolean; // Indica si el elemento es visible
}
// Custom hook para observar intersecciones
function useIntersectionObserver(
	options: IntersectionObserverOptions = {},
): IntersectionObserverResult {
	const inView = useSignal<boolean>(false);
	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!("IntersectionObserver" in window)) {
			// biome-ignore lint/suspicious/noConsole: Legacy support
			console.warn("IntersectionObserver no es soportado en este navegador.");
			return;
		}

		const {
			threshold = 0,
			triggerOnce = false,
			root = null,
			rootMargin = "0px",
		} = options;

		const observer = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						inView.value = true;
						if (triggerOnce) {
							observer.disconnect();
						}
					} else if (!triggerOnce) {
						inView.value = false;
					}
				}
			},
			{
				threshold,
				root,
				rootMargin,
			},
		);

		const currentRef = ref.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
			observer.disconnect();
		};
	}, [
		options.threshold,
		options.triggerOnce,
		options.root,
		options.rootMargin,
	]);
	return { ref, inView: inView.value };
}
export default useIntersectionObserver;
