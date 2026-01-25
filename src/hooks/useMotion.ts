import { animate } from "motion";
import { useEffect, useRef } from "preact/hooks";

export { animate };

export function useEntranceAnimation(
	delay: number = 0,
	duration: number = 0.5,
) {
	const ref = useRef<any>(null);

	useEffect(() => {
		if (!ref.current) return;

		animate(
			ref.current,
			{ opacity: [0, 1], y: [20, 0] },
			{ duration, delay, easing: "ease-out" },
		);
	}, [delay, duration]);

	return ref;
}

export function useHoverScale(scale: number = 1.05) {
	const ref = useRef<any>(null);

	const onMouseEnter = () => {
		if (ref.current) animate(ref.current, { scale }, { duration: 0.2 });
	};

	const onMouseLeave = () => {
		if (ref.current) animate(ref.current, { scale: 1 }, { duration: 0.2 });
	};

	return { ref, onMouseEnter, onMouseLeave };
}

export function useGlitchHover<T extends HTMLElement>() {
	const ref = useRef<T>(null);

	const onMouseEnter = () => {
		if (ref.current) {
			animate(
				ref.current,
				{ x: [0, -2, 2, -1, 1, 0], opacity: [1, 0.8, 1] },
				{ duration: 0.2, easing: "steps(3)" },
			);
		}
	};

	const onMouseLeave = () => {};

	return { ref, onMouseEnter, onMouseLeave };
}
