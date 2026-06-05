import type { translations } from "./translations.js";

export type Locale = "en" | "zh";
export type TranslationKey = keyof typeof translations.en;
