import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n/I18nContext.jsx';
import { getPaymentGatewaySettings, savePaymentGatewaySettings } from '../../services/settings.js';

export default function AdminPaymentGateway() {
  const t = useT();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPaymentGatewaySettings().then(setForm);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    await savePaymentGatewaySettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!form) return <p className="text-muted">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.payment_gateway_title')}</h1>
      <form onSubmit={onSubmit} className="panel-card" style={{ maxWidth: 640 }}>
        <p className="small text-muted mb-4">{t('admin.payment_gateway_help')}</p>
        <div className="custom-control custom-checkbox mb-3">
          <input type="checkbox" className="custom-control-input" id="pg-enabled" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          <label className="custom-control-label" htmlFor="pg-enabled">{t('admin.gateway_enabled')}</label>
        </div>
        <div className="form-group">
          <label>{t('admin.gateway_mode')}</label>
          <select className="form-control" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="sandbox">Sandbox</option>
            <option value="live">Live</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t('admin.merchant_id')}</label>
          <input className="form-control" value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{t('admin.public_key')}</label>
          <input className="form-control" value={form.publicKey} onChange={(e) => setForm({ ...form, publicKey: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{t('admin.secret_key')}</label>
          <input type="password" className="form-control" value={form.secretKey} onChange={(e) => setForm({ ...form, secretKey: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{t('admin.webhook_secret')}</label>
          <input type="password" className="form-control" value={form.webhookSecret} onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-brand">{saved ? t('admin.saved') : t('common.save')}</button>
      </form>
    </div>
  );
}
