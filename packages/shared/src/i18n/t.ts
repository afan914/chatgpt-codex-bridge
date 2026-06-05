import { translations } from "./translations.js";
import type { Locale, TranslationKey } from "./types.js";

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.en[key];
}
