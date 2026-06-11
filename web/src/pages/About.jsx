import React from 'react';
import { useT } from '../i18n/I18nContext.jsx';

export default function About() {
  const t = useT();
  return (
    <div className="container content-page px-3 px-md-4" style={{ maxWidth: 720 }}>
      <header className="section-header text-center text-md-left mb-4">
        <p className="section-header__eyebrow">{t('about.eyebrow')}</p>
        <h1 className="section-header__title">{t('about.title')}</h1>
      </header>
      <div className="p-4 p-md-5 rounded-card bg-white border" style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <p className="mb-3">{t('about.p1')}</p>
        <p className="mb-0 text-muted">{t('about.p2')}</p>
      </div>
    </div>
  );
}
