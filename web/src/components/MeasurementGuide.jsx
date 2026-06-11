import React from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function MeasurementGuide({ imageUrl }) {
  const { lang } = useI18n();
  const src = imageUrl || '/img/measurement-guide.svg';

  return (
    <div className="measurement-guide panel-card">
      <h3 className="h6 font-weight-bold mb-3">
        {lang === 'ar' ? 'دليل المقاسات' : 'Measurement guide'}
      </h3>
      <div className="measurement-guide__image">
        <img src={src} alt={lang === 'ar' ? 'دليل مقاسات العباية' : 'Abaya measurement guide'} />
      </div>
      <p className="small text-muted mb-0 mt-3">
        {lang === 'ar'
          ? 'استخدم الصورة أعلاه كمرجع وأدخل كل مقاس بالسنتيمتر.'
          : 'Use the diagram above as a reference and enter each measurement in centimeters.'}
      </p>
    </div>
  );
}
