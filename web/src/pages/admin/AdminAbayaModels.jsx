import React, { useEffect, useMemo, useState } from 'react';
import { useT } from '../../i18n/I18nContext.jsx';
import { deleteAbayaModel, listAbayaModels, saveAbayaModel } from '../../services/settings.js';
import { uploadAbayaModelImage } from '../../services/storage.js';

const empty = { name: '', nameAr: '', description: '', sortOrder: 1, active: true, imageUrl: '' };

export default function AdminAbayaModels() {
  const t = useT();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : form.imageUrl || null),
    [imageFile, form.imageUrl]
  );

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imageFile, imagePreview]);

  async function load() {
    setItems(await listAbayaModels());
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm(empty);
    setEditId(null);
    setImageFile(null);
    setErr('');
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({
      name: item.name,
      nameAr: item.nameAr || '',
      description: item.description || '',
      sortOrder: item.sortOrder || 1,
      active: item.active !== false,
      imageUrl: item.imageUrl || '',
    });
    setImageFile(null);
    setErr('');
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!editId && !imageFile && !form.imageUrl) {
      setErr(t('admin.model_image_required'));
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const payload = {
        name: form.name,
        nameAr: form.nameAr,
        description: form.description,
        sortOrder: form.sortOrder,
        active: form.active,
      };

      let id = editId;
      if (!id) id = await saveAbayaModel(null, { ...payload, imageUrl: form.imageUrl || '' });

      let imageUrl = form.imageUrl;
      if (imageFile) imageUrl = await uploadAbayaModelImage(imageFile, id);

      await saveAbayaModel(id, { ...payload, imageUrl });

      resetForm();
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm(t('admin.model_delete_confirm'))) return;
    setBusy(true);
    try {
      await deleteAbayaModel(id);
      if (editId === id) resetForm();
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.models_title')}</h1>
      {err ? <div className="alert alert-danger">{err}</div> : null}
      <div className="row">
        <div className="col-lg-5 mb-4">
          <form onSubmit={onSubmit} className="panel-card">
            <h3 className="h6 font-weight-bold mb-3">{editId ? t('admin.edit_model') : t('admin.add_model')}</h3>
            <div className="form-group">
              <label>{t('admin.name_en')}</label>
              <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t('admin.name_ar')}</label>
              <input className="form-control" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t('shop_products.description')}</label>
              <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t('admin.model_image')}</label>
              {imagePreview ? (
                <img src={imagePreview} alt="" className="abaya-model-option__img d-block mb-2" style={{ maxWidth: 140 }} />
              ) : null}
              <input
                type="file"
                className="form-control-file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="small text-muted mb-0 mt-1">{t('admin.model_image_help')}</p>
            </div>
            <div className="form-group">
              <label>{t('admin.sort_order')}</label>
              <input type="number" className="form-control" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
            <div className="custom-control custom-checkbox mb-3">
              <input type="checkbox" className="custom-control-input" id="model-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <label className="custom-control-label" htmlFor="model-active">{t('shop_products.active')}</label>
            </div>
            <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
              <button type="submit" className="btn btn-brand" disabled={busy}>{t('common.save')}</button>
              {editId ? (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>{t('common.cancel')}</button>
              ) : null}
            </div>
          </form>
        </div>
        <div className="col-lg-7">
          {!items.length ? <p className="text-muted">{t('admin.no_models')}</p> : null}
          <div className="row">
            {items.map((item) => (
              <div key={item.id} className="col-md-6 mb-3">
                <div className="panel-card h-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="abaya-model-option__img w-100 mb-2" />
                  ) : null}
                  <p className="font-weight-bold mb-1">{item.name}</p>
                  <p className="small text-muted mb-2">{item.active ? t('admin.active') : t('admin.inactive')}</p>
                  <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(item)} disabled={busy}>
                      {t('common.save')}
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(item.id)} disabled={busy}>
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
