import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n/I18nContext.jsx';
import { listMaterials, saveMaterial } from '../../services/settings.js';

const empty = { name: '', nameAr: '', description: '', priceModifier: 0, sortOrder: 1, active: true };

export default function AdminMaterials() {
  const t = useT();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  async function load() {
    setItems(await listMaterials());
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    await saveMaterial(editId, form);
    setForm(empty);
    setEditId(null);
    await load();
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({
      name: item.name,
      nameAr: item.nameAr || '',
      description: item.description || '',
      priceModifier: item.priceModifier || 0,
      sortOrder: item.sortOrder || 1,
      active: item.active !== false,
    });
  }

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.materials_title')}</h1>
      <div className="row">
        <div className="col-lg-5 mb-4">
          <form onSubmit={onSubmit} className="panel-card">
            <h3 className="h6 font-weight-bold mb-3">{editId ? t('common.save') : t('admin.add_material')}</h3>
            <div className="form-group"><label>{t('admin.name_en')}</label><input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>{t('admin.name_ar')}</label><input className="form-control" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
            <div className="form-group"><label>{t('shop_products.description')}</label><input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group col-6"><label>{t('admin.price_modifier')}</label><input type="number" className="form-control" value={form.priceModifier} onChange={(e) => setForm({ ...form, priceModifier: Number(e.target.value) })} /></div>
              <div className="form-group col-6"><label>{t('admin.sort_order')}</label><input type="number" className="form-control" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
            </div>
            <div className="custom-control custom-checkbox mb-3">
              <input type="checkbox" className="custom-control-input" id="mat-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <label className="custom-control-label" htmlFor="mat-active">{t('shop_products.active')}</label>
            </div>
            <button type="submit" className="btn btn-brand">{t('common.save')}</button>
          </form>
        </div>
        <div className="col-lg-7">
          {items.map((item) => (
            <div key={item.id} className="panel-card mb-2 d-flex justify-content-between align-items-center">
              <div>
                <p className="font-weight-bold mb-0">{item.name}</p>
                <p className="small text-muted mb-0">+{item.priceModifier || 0} BHD · {item.active ? t('admin.active') : t('admin.inactive')}</p>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(item)}>{t('common.save')}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
