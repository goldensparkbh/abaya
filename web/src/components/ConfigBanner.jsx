import React from 'react';
import { missingConfig } from '../firebase.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function ConfigBanner() {
  const t = useT();
  if (!missingConfig()) return null;
  return (
    <div className="alert config-banner m-0 rounded-0" role="alert">
      {t('config_banner')}
    </div>
  );
}
