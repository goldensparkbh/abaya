import React, { useEffect, useMemo, useState } from 'react';
import ShopBrand from '../../components/ShopBrand.jsx';
import { useT } from '../../i18n/I18nContext.jsx';
import {
  createShopAdmin,
  deleteShopAdmin,
  listShopOwnerCandidates,
  updateShopAdmin,
} from '../../services/admin.js';
import { listProducts, listShops } from '../../services/catalog.js';
import { uploadShopLogo } from '../../services/storage.js';

const emptyForm = () => ({
  userId: '',
  shopName: '',
  description: '',
  status: 'active',
  logo: '',
});

export default function AdminShops() {
  const t = useT();
  const [shops, setShops] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : form.logo || null),
    [logoFile, form.logo]
  );

  useEffect(() => {
    return () => {
      if (logoFile && logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    };
  }, [logoFile, logoPreview]);

  async function load() {
    const [s, c] = await Promise.all([listShops(false), listShopOwnerCandidates()]);
    setShops(s);
    setCandidates(c);
    const counts = {};
    await Promise.all(
      s.map(async (shop) => {
        const products = await listProducts({ shopId: shop.id, activeOnly: false });
        counts[shop.id] = products.length;
      })
    );
    setProductCounts(counts);
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm(emptyForm());
    setEditId(null);
    setLogoFile(null);
    setErr('');
    setMsg('');
  }

  function startEdit(shop) {
    setEditId(shop.id);
    setForm({
      userId: shop.id,
      shopName: shop.shopName || '',
      description: shop.description || '',
      status: shop.status || 'active',
      logo: shop.logo || '',
    });
    setLogoFile(null);
    setErr('');
    setMsg('');
  }

  function onSelectCandidate(userId) {
    const user = candidates.find((c) => c.id === userId);
    setForm({
      ...form,
      userId,
      shopName: user?.shopName || user?.displayName || '',
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const shopId = editId || form.userId;
      if (!shopId) {
        setErr(t('admin.shop_owner_required'));
        return;
      }

      let logo = form.logo;
      if (logoFile) logo = await uploadShopLogo(logoFile, shopId);

      const payload = {
        shopName: form.shopName,
        description: form.description,
        status: form.status,
        ...(logo ? { logo } : {}),
      };

      if (editId) {
        await updateShopAdmin(editId, payload);
        setMsg(t('admin.shop_updated'));
      } else {
        await createShopAdmin({ userId: shopId, ...payload, logo });
        setMsg(t('admin.shop_created'));
      }

      resetForm();
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(shop) {
    if (!window.confirm(t('admin.shop_delete_confirm', { name: shop.shopName }))) return;
    setBusy(true);
    setErr('');
    try {
      await deleteShopAdmin(shop.id);
      if (editId === shop.id) resetForm();
      setMsg(t('admin.shop_deleted'));
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.shops_title')}</h1>
      {err ? <div className="alert alert-danger">{err}</div> : null}
      {msg ? <div className="alert alert-success">{msg}</div> : null}

      <div className="row mb-4">
        <div className="col-lg-5 mb-4">
          <form onSubmit={onSubmit} className="panel-card">
            <h3 className="h6 font-weight-bold mb-3">
              {editId ? t('admin.edit_shop') : t('admin.add_shop')}
            </h3>

            {!editId ? (
              <div className="form-group">
                <label>{t('admin.shop_owner')}</label>
                {candidates.length ? (
                  <select
                    className="form-control"
                    required
                    value={form.userId}
                    onChange={(e) => onSelectCandidate(e.target.value)}
                  >
                    <option value="">{t('admin.shop_owner_select')}</option>
                    {candidates.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.displayName || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="small text-muted mb-0">{t('admin.shop_no_candidates')}</p>
                )}
              </div>
            ) : (
              <p className="small text-muted mb-3">{t('admin.shop_id')}: {editId}</p>
            )}

            <div className="form-group">
              <label>{t('admin.shop_name')}</label>
              <input
                className="form-control"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('shop_dashboard.description')}</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('admin.col_status')}</label>
              <select
                className="form-control"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">{t('admin.active')}</option>
                <option value="suspended">{t('admin.suspended')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('shop_dashboard.logo_upload')}</label>
              {logoPreview ? (
                <img src={logoPreview} alt="" className="shop-logo-upload__preview d-block mb-2" />
              ) : null}
              <input
                type="file"
                className="form-control-file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
              <button type="submit" className="btn btn-brand" disabled={busy || (!editId && !candidates.length)}>
                {t('common.save')}
              </button>
              {editId ? (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  {t('common.cancel')}
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="col-lg-7">
          {!shops.length ? <p className="text-muted">{t('admin.no_shops')}</p> : null}
          {shops.map((shop) => (
            <div key={shop.id} className={`panel-card mb-3${editId === shop.id ? ' shop-product-item--editing' : ''}`}>
              <div className="d-flex justify-content-between flex-wrap align-items-start">
                <div className="d-flex flex-wrap align-items-start" style={{ gap: '0.75rem' }}>
                  <ShopBrand name={shop.shopName} logo={shop.logo} size="md" />
                  <div>
                    <p className="small text-muted mb-1">{shop.description || '—'}</p>
                    <p className="small mb-0">{t('admin.products_count', { n: productCounts[shop.id] || 0 })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${shop.status === 'active' ? 'badge-done' : 'badge-warn'}`}>
                    {shop.status === 'active' ? t('admin.active') : t('admin.suspended')}
                  </span>
                </div>
              </div>
              <div className="d-flex flex-wrap mt-3" style={{ gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-brand"
                  disabled={busy}
                  onClick={() => startEdit(shop)}
                >
                  {t('admin.edit_shop')}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  disabled={busy}
                  onClick={() => onDelete(shop)}
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
