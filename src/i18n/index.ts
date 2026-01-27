import { defaultLang, languages, ui } from "./ui";

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split("/");
	if (lang in ui) return lang as keyof typeof ui;
	return defaultLang;
}

export function useTranslations(lang: keyof typeof ui = defaultLang) {
	return function t(
		key: keyof (typeof ui)[typeof defaultLang],
		params?: Record<string, string | number>,
	) {
		let translation: string =
			(ui[lang] as (typeof ui)[typeof defaultLang])[key] ||
			ui[defaultLang][key];
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

export { languages };
export type Lang = keyof typeof ui;
