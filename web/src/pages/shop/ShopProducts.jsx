import React, { useEffect, useMemo, useState } from 'react';
import ColorSwatches from '../../components/ColorSwatches.jsx';
import ConfigBanner from '../../components/ConfigBanner.jsx';
import TagInput from '../../components/TagInput.jsx';
import usePlatformColors from '../../hooks/usePlatformColors.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useT } from '../../i18n/I18nContext.jsx';
import { createProduct, ensureShopProfile, listProducts, updateProduct } from '../../services/catalog.js';
import { uploadProductImage } from '../../services/storage.js';
import { db } from '../../firebase.js';

const CATEGORIES = ['Everyday', 'Occasion', 'Modern', 'Formal', 'Ramadan', 'Eid'];

const emptyForm = () => ({
  name: '',
  description: '',
  price: '',
  category: 'Everyday',
  sizes: ['Free size'],
  colors: [],
  stock: '10',
  active: true,
  images: [],
});

function ProductEditor({ form, setForm, imageFile, setImageFile, onSubmit, onCancel, busy, isEdit, t }) {
  const uploadPreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );

  useEffect(() => {
    return () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    };
  }, [uploadPreview]);

  return (
    <form onSubmit={onSubmit} className="product-editor panel-card">
      <h3 className="h6 font-weight-bold mb-3">
        {isEdit ? t('shop_products.edit') : t('shop_products.add')}
      </h3>

      <div className="row">
        <div className="col-md-8">
          <div className="form-group">
            <label>{t('shop_products.name')}</label>
            <input
              className="form-control"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{t('shop_products.description')}</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <div className="col-md-4">
          <label>{t('shop_products.image')}</label>
          <div className="product-editor__image-preview mb-2">
            <img
              src={uploadPreview || form.images?.[0] || '/img/placeholder-product.svg'}
              alt=""
            />
          </div>
          <input
            type="file"
            className="form-control-file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {isEdit && !imageFile ? (
            <p className="small text-muted mt-1 mb-0">{t('shop_products.image_keep')}</p>
          ) : null}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group col-md-4">
          <label>{t('shop_products.price')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div className="form-group col-md-4">
          <label>{t('shop_products.stock')}</label>
          <input
            type="number"
            min="0"
            className="form-control"
            required
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>
        <div className="form-group col-md-4">
          <label>{t('shop_products.category')}</label>
          <select
            className="form-control"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <TagInput
            label={t('shop_products.sizes')}
            tags={form.sizes}
            onChange={(sizes) => setForm({ ...form, sizes })}
            placeholder={t('shop_products.sizes_ph')}
          />
        </div>
        <div className="col-md-6">
          <TagInput
            label={t('shop_products.colors')}
            tags={form.colors}
            onChange={(colors) => setForm({ ...form, colors })}
            placeholder={t('shop_products.colors_ph')}
          />
        </div>
      </div>

      <div className="custom-control custom-checkbox mb-3 mt-2">
        <input
          type="checkbox"
          className="custom-control-input"
          id={`active-${isEdit ? 'edit' : 'new'}`}
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        <label className="custom-control-label" htmlFor={`active-${isEdit ? 'edit' : 'new'}`}>
          {t('shop_products.active')}
        </label>
      </div>

      <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
        <button type="submit" className="btn btn-brand" disabled={busy}>
          {busy ? t('common.loading') : isEdit ? t('shop_products.save_changes') : t('shop_products.add_btn')}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function ShopProducts() {
  const t = useT();
  const { user, profile } = useAuth();
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addForm, setAddForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState(emptyForm());
  const [addImage, setAddImage] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [stockDraft, setStockDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const { lookup } = usePlatformColors();

  async function load() {
    if (!user) return;
    await ensureShopProfile({
      uid: user.uid,
      displayName: profile?.displayName,
      shopName: profile?.shopName,
    });
    const rows = await listProducts({ shopId: user.uid, activeOnly: false });
    setProducts(rows);
    const draft = {};
    rows.forEach((p) => { draft[p.id] = String(p.stock ?? 0); });
    setStockDraft(draft);
  }

  useEffect(() => {
    if (db && user) load();
  }, [user]);

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  function productPayload(form, imageFile, existingImages = []) {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      sizes: form.sizes.length ? form.sizes : ['Free size'],
      colors: form.colors,
      stock: Math.max(0, Number(form.stock)),
      active: form.active,
    };
    if (imageFile) return payload;
    if (existingImages.length) payload.images = existingImages;
    return payload;
  }

  async function saveProduct({ form, imageFile, productId, existingImages }) {
    if (!form.name.trim() || form.price === '') {
      setErr(t('shop_products.err_required'));
      return;
    }
    if (!form.sizes.length) {
      setErr(t('shop_products.err_sizes'));
      return;
    }

    setBusy(true);
    setErr('');
    setMsg('');
    try {
      let data = productPayload(form, imageFile, existingImages);
      if (imageFile) {
        const url = await uploadProductImage(imageFile, user.uid);
        data.images = [url];
      } else if (!productId) {
        data.images = ['/img/placeholder-product.svg'];
      }

      if (productId) {
        await updateProduct(productId, data);
        setMsg(t('shop_products.saved'));
        setEditingId(null);
        setEditImage(null);
      } else {
        await createProduct(user.uid, profile?.shopName || profile?.displayName || 'Shop', data);
        setMsg(t('shop_products.added'));
        setShowAdd(false);
        setAddForm(emptyForm());
        setAddImage(null);
      }
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setShowAdd(false);
    setEditForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      category: p.category || 'Everyday',
      sizes: p.sizes?.length ? [...p.sizes] : ['Free size'],
      colors: p.colors ? [...p.colors] : [],
      stock: String(p.stock ?? 0),
      active: p.active !== false,
      images: p.images || [],
    });
    setEditImage(null);
    setErr('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditImage(null);
    setEditForm(emptyForm());
  }

  async function toggleActive(p) {
    await updateProduct(p.id, { active: !p.active });
    await load();
  }

  async function saveStock(productId) {
    const stock = Math.max(0, Number(stockDraft[productId]));
    if (Number.isNaN(stock)) return;
    setBusy(true);
    try {
      await updateProduct(productId, { stock });
      setMsg(t('shop_products.stock_updated'));
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h1 className="cart-page-title mb-0">{t('shop_products.title')}</h1>
        <button
          type="button"
          className="btn btn-brand"
          onClick={() => {
            setShowAdd((v) => !v);
            setEditingId(null);
            setErr('');
          }}
        >
          {showAdd ? t('common.cancel') : `+ ${t('shop_products.add')}`}
        </button>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}
      {msg ? <div className="alert alert-success">{msg}</div> : null}

      {showAdd ? (
        <div className="mb-4">
          <ProductEditor
            form={addForm}
            setForm={setAddForm}
            imageFile={addImage}
            setImageFile={setAddImage}
            busy={busy}
            isEdit={false}
            t={t}
            onCancel={() => { setShowAdd(false); setAddForm(emptyForm()); setAddImage(null); }}
            onSubmit={(e) => {
              e.preventDefault();
              saveProduct({ form: addForm, imageFile: addImage });
            }}
          />
        </div>
      ) : null}

      {!products.length ? (
        <div className="empty-state">
          <p className="text-muted mb-3">{t('shop_products.empty')}</p>
          <button type="button" className="btn btn-brand" onClick={() => setShowAdd(true)}>
            + {t('shop_products.add')}
          </button>
        </div>
      ) : null}

      <div className="shop-product-list">
        {products.map((p) => (
          <div key={p.id} className={`shop-product-item panel-card mb-3${editingId === p.id ? ' shop-product-item--editing' : ''}`}>
            <div className="shop-product-item__row">
              <img
                src={p.images?.[0] || '/img/placeholder-product.svg'}
                alt=""
                className="shop-product-item__thumb"
              />
              <div className="shop-product-item__body">
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div>
                    <h3 className="h6 font-weight-bold mb-1">{p.name}</h3>
                    <p className="small text-muted mb-1">{p.category || '—'} · {p.price} BHD</p>
                  </div>
                  <span className={`status-badge ${p.active !== false ? 'badge-done' : 'badge-muted'}`}>
                    {p.active !== false ? t('shop_products.listed') : t('shop_products.hidden')}
                  </span>
                </div>
                <p className="small mb-2 text-muted" style={{ lineHeight: 1.5 }}>
                  {p.description || '—'}
                </p>
                <div className="shop-product-item__meta small">
                  <span><strong>{t('shop_products.stock')}:</strong> {p.stock ?? 0}</span>
                  <span><strong>{t('shop_products.sizes')}:</strong> {(p.sizes || []).join(', ') || '—'}</span>
                  <span className="shop-product-item__colors">
                    <strong>{t('shop_products.colors')}:</strong>{' '}
                    {p.colors?.length ? (
                      <ColorSwatches colors={p.colors} lookup={lookup} size="sm" readOnly />
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
                <div className="shop-product-item__stock-edit d-flex align-items-center flex-wrap mt-2">
                  <label className="small mb-0 mr-2">{t('shop_products.quick_stock')}:</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-sm"
                    style={{ width: 88 }}
                    value={stockDraft[p.id] ?? ''}
                    onChange={(e) => setStockDraft({ ...stockDraft, [p.id]: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary ml-2"
                    disabled={busy}
                    onClick={() => saveStock(p.id)}
                  >
                    {t('shop_products.update_stock')}
                  </button>
                </div>
              </div>
              <div className="shop-product-item__actions">
                <button
                  type="button"
                  className="btn btn-sm btn-brand"
                  onClick={() => (editingId === p.id ? cancelEdit() : startEdit(p))}
                >
                  {editingId === p.id ? t('common.cancel') : t('shop_products.edit_btn')}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => toggleActive(p)}
                >
                  {p.active !== false ? t('shop_products.hide') : t('shop_products.show')}
                </button>
              </div>
            </div>

            {editingId === p.id ? (
              <div className="shop-product-item__editor mt-3 pt-3 border-top">
                <ProductEditor
                  form={editForm}
                  setForm={setEditForm}
                  imageFile={editImage}
                  setImageFile={setEditImage}
                  busy={busy}
                  isEdit
                  t={t}
                  onCancel={cancelEdit}
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveProduct({
                      form: editForm,
                      imageFile: editImage,
                      productId: p.id,
                      existingImages: editForm.images,
                    });
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
