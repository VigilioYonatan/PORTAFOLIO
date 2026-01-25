import { useSignal } from "@preact/signals";
import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

// biome-ignore lint/suspicious/noExplicitAny: Legacy support
function useVisible(options = {}): [RefObject<any>, boolean] {
	const isVisible = useSignal(false);
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	const elementRef = useRef<any | null>(null);

	useEffect(() => {
		const observerOptions: IntersectionObserverInit = {
			root: null, // Utiliza el viewport
			rootMargin: "0px", // Márgenes alrededor del viewport
			threshold: 1.0, // 100% del elemento visible
			...options, // Permite pasar opciones personalizadas
		};

		const handleIntersection = (
			entries: IntersectionObserverEntry[],
			_: IntersectionObserver,
		) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					isVisible.value = true;
				} else {
					isVisible.value = false;
				}
			}
		};

		const observer = new IntersectionObserver(
			handleIntersection,
			observerOptions,
		);

		if (elementRef.current) {
			observer.observe(elementRef.current);
		}

		return () => {
			if (elementRef.current) {
				observer.unobserve(elementRef.current);
			}
		};
	}, [options]);

	return [elementRef, isVisible.value];
}

export default useVisible;
