import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n/I18nContext.jsx';
import { listEmailTemplates, saveEmailTemplate } from '../../services/settings.js';

export default function AdminEmailTemplates() {
  const t = useT();
  const [templates, setTemplates] = useState([]);
  const [edit, setEdit] = useState(null);

  async function load() {
    setTemplates(await listEmailTemplates());
  }

  useEffect(() => { load(); }, []);

  async function onSave(e) {
    e.preventDefault();
    await saveEmailTemplate(edit.id, edit);
    setEdit(null);
    await load();
  }

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.emails_title')}</h1>
      <p className="small text-muted mb-4">{t('admin.templates_help')}</p>
      {templates.map((tpl) => (
        <div key={tpl.id} className="panel-card mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="font-weight-bold mb-0">{tpl.name || tpl.key}</p>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEdit(tpl)}>{t('common.save')}</button>
          </div>
          <p className="small text-muted mb-0">{tpl.subject}</p>
        </div>
      ))}
      {edit ? (
        <form onSubmit={onSave} className="panel-card mt-4">
          <h3 className="h6 font-weight-bold mb-3">{edit.name}</h3>
          <div className="form-group"><label>{t('admin.subject_en')}</label><input className="form-control" value={edit.subject} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} /></div>
          <div className="form-group"><label>{t('admin.subject_ar')}</label><input className="form-control" value={edit.subjectAr || ''} onChange={(e) => setEdit({ ...edit, subjectAr: e.target.value })} /></div>
          <div className="form-group"><label>{t('admin.body_en')}</label><textarea className="form-control" rows={4} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} /></div>
          <div className="form-group"><label>{t('admin.body_ar')}</label><textarea className="form-control" rows={4} value={edit.bodyAr || ''} onChange={(e) => setEdit({ ...edit, bodyAr: e.target.value })} /></div>
          <div className="custom-control custom-checkbox mb-3">
            <input type="checkbox" className="custom-control-input" id="email-enabled" checked={edit.enabled} onChange={(e) => setEdit({ ...edit, enabled: e.target.checked })} />
            <label className="custom-control-label" htmlFor="email-enabled">{t('admin.template_enabled')}</label>
          </div>
          <button type="submit" className="btn btn-brand">{t('common.save')}</button>
          <button type="button" className="btn btn-outline-secondary ml-2" onClick={() => setEdit(null)}>{t('common.cancel')}</button>
        </form>
      ) : null}
    </div>
  );
}
