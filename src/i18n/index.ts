import { defaultLang, languages, ui } from "./ui";

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split("/");
	if (lang in ui) return lang as keyof typeof ui;
	return defaultLang;
}

// Helper to access nested properties by dot notation
function getNestedValue(obj: any, key: string): string | undefined {
	return key.split(".").reduce((o, i) => (o ? o[i] : undefined), obj) as
		| string
		| undefined;
}

// Utility type for dot notation keys
type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}${"" extends P ? "" : "."}${P}`
		: never
	: never;

type Prev = [
	never,
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	...0[],
];

type Paths<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
		? {
				[K in keyof T]-?: K extends string | number
					? `${K}` | Join<K, Paths<T[K], Prev[D]>>
					: never;
			}[keyof T]
		: "";
            
export type TxKeyPath = Paths<typeof ui.es>;

export function useTranslations(lang: keyof typeof ui = defaultLang) {
	return function t(
		key: TxKeyPath,
		params?: Record<string, string | number>,
	) {
		let translation =
			getNestedValue(ui[lang], key as string) ||
			getNestedValue(ui[defaultLang], key as string);
        
        if (!translation) return key as string;

		if (params) {
			for (const [k, v] of Object.entries(params)) {
				translation = translation.replace(`{${k}}`, String(v));
			}
		}
		return translation;
	};
}

export function getTranslatedPath(path: string, lang: string) {
	return `/${lang}${path}`;
}

export { languages, defaultLang };
export type Lang = keyof typeof ui;
export type T = ReturnType<typeof useTranslations>;
