import type { FilesSchema } from "../schemas/upload.schema";

export type KeysOfType<T, SelectedType> = {
	[K in keyof T]: T[K] extends SelectedType ? K : never;
}[keyof T];

// Usamos esta versión que "limpia" mejor las uniones
export type PickByType<T, SelectedType> = T extends any
	? Pick<T, KeysOfType<T, SelectedType>>
	: never;
// 3. Resultado final
export type OnlyFiles<T> = PickByType<T, FilesSchema[] | null>;
