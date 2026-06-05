import { useEffect, useState } from "react";
import type { Locale } from "@chatgpt-codex-bridge/shared";

const LOCALE_STORAGE_KEY = "chatgptCodexBridge.locale";

type UseLocaleResult = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  isLoading: boolean;
};

export function useLocale(): UseLocaleResult {
  const [locale, setLocaleState] = useState<Locale>(getBrowserLocale());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(LOCALE_STORAGE_KEY, (items) => {
      const runtimeError = chrome.runtime.lastError;
      if (!runtimeError) {
        const savedLocale = items[LOCALE_STORAGE_KEY];
        if (savedLocale === "en" || savedLocale === "zh") {
          setLocaleState(savedLocale);
        }
      }
      setIsLoading(false);
    });
  }, []);

  async function setLocale(nextLocale: Locale): Promise<void> {
    setLocaleState(nextLocale);
    await chrome.storage.local.set({ [LOCALE_STORAGE_KEY]: nextLocale });
  }

  return { locale, setLocale, isLoading };
}

function getBrowserLocale(): Locale {
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}
