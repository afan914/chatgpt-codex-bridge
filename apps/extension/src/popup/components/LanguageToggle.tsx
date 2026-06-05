import type { Locale } from "@chatgpt-codex-bridge/shared";

type LanguageToggleProps = {
  locale: Locale;
  onChange: (locale: Locale) => void;
  englishLabel: string;
  chineseLabel: string;
};

export function LanguageToggle({ locale, onChange, englishLabel, chineseLabel }: LanguageToggleProps): JSX.Element {
  return (
    <div className="language-toggle" role="group" aria-label="Language">
      <button
        className={locale === "en" ? "language-toggle__button language-toggle__button--active" : "language-toggle__button"}
        type="button"
        onClick={() => onChange("en")}
      >
        {englishLabel}
      </button>
      <button
        className={locale === "zh" ? "language-toggle__button language-toggle__button--active" : "language-toggle__button"}
        type="button"
        onClick={() => onChange("zh")}
      >
        {chineseLabel}
      </button>
    </div>
  );
}
