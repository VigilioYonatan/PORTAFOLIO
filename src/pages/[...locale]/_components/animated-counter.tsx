import { useEffect, useRef, useState } from "preact/hooks";

interface AnimatedCounterProps {
	value: string;
	duration?: number;
}

export default function AnimatedCounter({
	value,
	duration = 2000,
}: AnimatedCounterProps) {
	const [count, setCount] = useState(0);
	const [hasAnimated, setHasAnimated] = useState(false);
	const elementRef = useRef<HTMLSpanElement>(null);

	// Parse value to separate number and suffix (e.g., "50+" -> 50, "+")
	const match = value.match(/(\d+)(.*)/);
	const target = match ? parseInt(match[1], 10) : 0;
	const suffix = match ? match[2] : "";

	useEffect(() => {
		// Use IntersectionObserver to start animation only when visible
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !hasAnimated) {
					setHasAnimated(true);
					animate();
				}
			},
			{ threshold: 0.1 },
		);

		if (elementRef.current) {
			observer.observe(elementRef.current);
		}

		return () => observer.disconnect();
	}, [hasAnimated]);

	const animate = () => {
		let startTimestamp: number | null = null;
		const step = (timestamp: number) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);

			// Ease out expo
			const easeProgress = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);

			setCount(Math.floor(easeProgress * target));

			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		};

		window.requestAnimationFrame(step);
	};

	return (
		<span ref={elementRef} class="tabular-nums">
			{count}
			{suffix}
		</span>
	);
}
