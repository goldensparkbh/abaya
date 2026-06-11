import React from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, locales } = useI18n();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language">
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-switch__btn ${lang === l.code ? 'is-active' : ''}`}
          onClick={() => setLang(l.code)}
          lang={l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
