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
