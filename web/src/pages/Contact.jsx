import React from 'react';
import { useT } from '../i18n/I18nContext.jsx';

export default function Contact() {
  const t = useT();
  return (
    <div className="container content-page px-3 px-md-4" style={{ maxWidth: 720 }}>
      <header className="section-header text-center text-md-left mb-4">
        <p className="section-header__eyebrow">{t('contact.eyebrow')}</p>
        <h1 className="section-header__title">{t('contact.title')}</h1>
        <p className="section-header__subtitle">{t('contact.subtitle')}</p>
      </header>
      <div className="p-4 p-md-5 rounded-card bg-white border" style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <p className="mb-2"><strong>{t('contact.whatsapp')}</strong></p>
        <p className="text-muted mb-4">{t('contact.whatsapp_body')}</p>
        <p className="mb-2"><strong>{t('contact.email')}</strong></p>
        <p className="text-muted mb-0">{t('contact.email_body')}</p>
      </div>
    </div>
  );
}
