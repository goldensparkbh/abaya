import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n/I18nContext.jsx';
import { listWhatsAppTemplates, saveWhatsAppTemplate } from '../../services/settings.js';

export default function AdminWhatsAppTemplates() {
  const t = useT();
  const [templates, setTemplates] = useState([]);
  const [edit, setEdit] = useState(null);

  async function load() {
    setTemplates(await listWhatsAppTemplates());
  }

  useEffect(() => { load(); }, []);

  async function onSave(e) {
    e.preventDefault();
    await saveEmailTemplateCompat(edit);
    setEdit(null);
    await load();
  }

  async function saveEmailTemplateCompat(data) {
    await saveWhatsAppTemplate(data.id, data);
  }

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.whatsapp_title')}</h1>
      <p className="small text-muted mb-4">{t('admin.whatsapp_help')}</p>
      {templates.map((tpl) => (
        <div key={tpl.id} className="panel-card mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="font-weight-bold mb-0">{tpl.name || tpl.key}</p>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEdit(tpl)}>{t('common.save')}</button>
          </div>
          <p className="small text-muted mb-0">{tpl.template}</p>
        </div>
      ))}
      {edit ? (
        <form onSubmit={onSave} className="panel-card mt-4">
          <h3 className="h6 font-weight-bold mb-3">{edit.name}</h3>
          <div className="form-group"><label>{t('admin.body_en')}</label><textarea className="form-control" rows={3} value={edit.template} onChange={(e) => setEdit({ ...edit, template: e.target.value })} /></div>
          <div className="form-group"><label>{t('admin.body_ar')}</label><textarea className="form-control" rows={3} value={edit.templateAr || ''} onChange={(e) => setEdit({ ...edit, templateAr: e.target.value })} /></div>
          <div className="custom-control custom-checkbox mb-3">
            <input type="checkbox" className="custom-control-input" id="wa-enabled" checked={edit.enabled} onChange={(e) => setEdit({ ...edit, enabled: e.target.checked })} />
            <label className="custom-control-label" htmlFor="wa-enabled">{t('admin.template_enabled')}</label>
          </div>
          <button type="submit" className="btn btn-brand">{t('common.save')}</button>
          <button type="button" className="btn btn-outline-secondary ml-2" onClick={() => setEdit(null)}>{t('common.cancel')}</button>
        </form>
      ) : null}
    </div>
  );
}
