import type { FieldErrors } from "react-hook-form";

export function anidarPropiedades<T extends object>(
	obj: FieldErrors<T>,
	keysArray: string[],
) {
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	let currentObj: any = obj;

	for (let i = 0; i < keysArray.length; i++) {
		const key = keysArray[i];

		// si no existe o no es un objeto, lo inicializamos
		if (typeof currentObj[key] !== "object" || currentObj[key] === null) {
			currentObj[key] = {};
		}

		currentObj = currentObj[key];
	}

	return currentObj;
}

export function extractErrors(
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	obj: any,
	prefix = "",
): { field: string; message: string }[] {
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	const list: any[] = [];

	for (const [key, value] of Object.entries(obj)) {
		const fieldName = prefix ? `${prefix}.${key}` : key;
		// biome-ignore lint/suspicious/noExplicitAny: Legacy support
		if (value && typeof value === "object" && (value as any).message) {
			// biome-ignore lint/suspicious/noExplicitAny: Legacy support
			list.push({ field: fieldName, message: (value as any).message });
		} else if (typeof value === "object") {
			list.push(...extractErrors(value, fieldName));
		}
	}

	return list;
}
