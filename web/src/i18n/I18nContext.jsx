import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES, translations } from './translations.js';

const I18nContext = createContext(null);

function getInitialLang() {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem('abaya:lang');
  if (saved && translations[saved]) return saved;
  const nav = (window.navigator?.language || '').toLowerCase();
  return nav.startsWith('ar') ? 'ar' : 'en';
}

function lookup(dict, key) {
  if (!dict) return undefined;
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    const locale = LOCALES.find((l) => l.code === lang) || LOCALES[0];
    document.documentElement.setAttribute('lang', locale.code);
    document.documentElement.setAttribute('dir', locale.dir);
    document.body?.classList?.toggle('rtl', locale.dir === 'rtl');
    document.body?.classList?.toggle('ltr', locale.dir !== 'rtl');
    document.title = lookup(translations[lang], 'app.name') || 'Abaya Boutique';
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem('abaya:lang', next);
    } catch (_) {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const hit = lookup(translations[lang], key);
      if (typeof hit === 'string') return interpolate(hit, vars);
      const fallback = lookup(translations.en, key);
      if (typeof fallback === 'string') return interpolate(fallback, vars);
      return key;
    },
    [lang]
  );

  const dir = useMemo(() => (LOCALES.find((l) => l.code === lang) || LOCALES[0]).dir, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, dir, locales: LOCALES }), [lang, setLang, t, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
