export const LANGUAGES = ["es", "en", "pt"] as const;
export type Language = (typeof LANGUAGES)[number];
