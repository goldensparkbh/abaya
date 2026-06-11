import React, { useEffect, useState } from 'react';
import MeasurementGuide from '../../components/MeasurementGuide.jsx';
import { useT } from '../../i18n/I18nContext.jsx';
import { getPlatformSettings, savePlatformSettings } from '../../services/settings.js';
import { uploadMeasurementGuide } from '../../services/storage.js';

export default function AdminMeasurementGuide() {
  const t = useT();
  const [settings, setSettings] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPlatformSettings().then(setSettings);
  }, []);

  async function onUpload(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMeasurementGuide(file);
      const next = { ...settings, measurementGuideUrl: url };
      await savePlatformSettings(next);
      setSettings(next);
      setFile(null);
    } finally {
      setBusy(false);
    }
  }

  async function saveFee(e) {
    e.preventDefault();
    await savePlatformSettings(settings);
  }

  if (!settings) return <p className="text-muted">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.measurement_title')}</h1>
      <div className="row">
        <div className="col-lg-5 mb-4">
          <form onSubmit={onUpload} className="panel-card mb-4">
            <h3 className="h6 font-weight-bold mb-3">{t('admin.upload_guide')}</h3>
            <p className="small text-muted">{t('admin.upload_guide_help')}</p>
            <input type="file" className="form-control-file mb-3" accept="image/*,.svg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="submit" className="btn btn-brand" disabled={!file || busy}>{busy ? t('common.loading') : t('admin.upload')}</button>
          </form>
          <form onSubmit={saveFee} className="panel-card">
            <h3 className="h6 font-weight-bold mb-3">{t('admin.platform_settings')}</h3>
            <div className="form-group">
              <label>{t('admin.custom_fee')}</label>
              <input type="number" className="form-control" value={settings.customDesignFee} onChange={(e) => setSettings({ ...settings, customDesignFee: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>{t('checkout.shipping_fee')}</label>
              <input type="number" className="form-control" value={settings.shippingFee} onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })} />
            </div>
            <button type="submit" className="btn btn-brand">{t('common.save')}</button>
          </form>
        </div>
        <div className="col-lg-7">
          <MeasurementGuide imageUrl={settings.measurementGuideUrl} />
        </div>
      </div>
    </div>
  );
}
