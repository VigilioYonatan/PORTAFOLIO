type FilterPredicate<T> = (item: T, index: number, array: T[]) => boolean;

//  reduce + mapa es más rápido que filter anidado porque evita recorridos múltiples (O(n) vs O(n²)) y permite accesos instantáneos (O(1)) a los datos agrupados., filter usar para pequeños arrays
export function filterWithReduce<T>(
	array: T[],
	predicate: FilterPredicate<T>,
): T[] {
	return array.reduce<T[]>((acc, current, index, original) => {
		predicate(current, index, original) && acc.push(current);
		return acc;
	}, []);
}
export function groupBy<T, K extends string | number>(
	array: T[],
	keyFn: (item: T) => K,
): Record<K, T[]> {
	return array.reduce(
		(acc, item) => {
			const key = keyFn(item);
			// biome-ignore lint/suspicious/noAssignInExpressions: Legacy support
			(acc[key] = acc[key] || []).push(item);
			return acc;
		},
		{} as Record<K, T[]>,
	);
}
