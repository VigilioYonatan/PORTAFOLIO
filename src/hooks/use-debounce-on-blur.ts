import { useCallback, useRef } from "preact/hooks";

export function useDebouncedOnBlur<T>(
	callback: (value: T) => void,
	delay = 800,
) {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const debouncedCallback = useCallback(
		(value: T) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				callback(value);
			}, delay);
		},
		[callback, delay],
	);

	return debouncedCallback;
}
export default useDebouncedOnBlur;
