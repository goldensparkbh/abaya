import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfigBanner from '../../components/ConfigBanner.jsx';
import ShopBrand from '../../components/ShopBrand.jsx';
import OrderTracker from '../../components/OrderTracker.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n, useT } from '../../i18n/I18nContext.jsx';
import { ensureShopProfile, listProducts, updateShopLogo, upsertShop } from '../../services/catalog.js';
import { listShopOrders } from '../../services/orders.js';
import { uploadShopLogo } from '../../services/storage.js';
import { db } from '../../firebase.js';

export default function ShopDashboard() {
  const t = useT();
  const { lang } = useI18n();
  const { user, profile } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile]
  );

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  async function load() {
    if (!user) return;
    const s = await ensureShopProfile({
      uid: user.uid,
      displayName: profile?.displayName,
      shopName: profile?.shopName,
    });
    setShop(s);
    setDescription(s.description || '');
    const [p, o] = await Promise.all([
      listProducts({ shopId: user.uid, activeOnly: false }),
      listShopOrders(user.uid),
    ]);
    setProducts(p);
    setOrders(o);
  }

  useEffect(() => {
    if (db && user) load();
  }, [user, profile]);

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');
  const revenue = orders.filter((o) => o.status === 'paid').reduce((s, o) => {
    const shopTotal = o.items?.filter((i) => i.shopId === user?.uid).reduce((n, i) => n + i.price * i.quantity, 0) || 0;
    return s + shopTotal;
  }, 0);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      let logo = shop?.logo || null;
      if (logoFile) {
        logo = await uploadShopLogo(logoFile, user.uid);
        await updateShopLogo(user.uid, logo);
      }
      await upsertShop(user.uid, {
        shopName: profile?.shopName || profile?.displayName || shop?.shopName,
        description: description.trim(),
        ...(logo ? { logo } : {}),
      });
      setLogoFile(null);
      setMsg(t('shop_dashboard.profile_saved'));
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div className="d-flex align-items-center flex-wrap" style={{ gap: '0.75rem' }}>
          <ShopBrand
            name={shop?.shopName}
            logo={logoPreview || shop?.logo}
            size="md"
          />
        </div>
        <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
          <Link to="/shop/orders" className="btn btn-outline-secondary">{t('nav.shop_orders')}</Link>
          <Link to="/shop/products" className="btn btn-brand">{t('shop_dashboard.manage_products')}</Link>
        </div>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}
      {msg ? <div className="alert alert-success">{msg}</div> : null}

      <div className="row mb-4">
        <div className="col-lg-5 mb-4">
          <form onSubmit={saveProfile} className="panel-card h-100">
            <h2 className="h6 font-weight-bold mb-3">{t('shop_dashboard.brand_title')}</h2>
            <p className="small text-muted mb-3">{t('shop_dashboard.brand_help')}</p>
            <div className="shop-logo-upload mb-3">
              <img
                src={logoPreview || shop?.logo || '/img/placeholder-product.svg'}
                alt=""
                className="shop-logo-upload__preview"
              />
            </div>
            <div className="form-group">
              <label>{t('shop_dashboard.logo_upload')}</label>
              <input
                type="file"
                className="form-control-file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="form-group">
              <label>{t('shop_dashboard.description')}</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('shop_dashboard.description_ph')}
              />
            </div>
            <button type="submit" className="btn btn-brand" disabled={busy}>
              {busy ? t('common.loading') : t('shop_dashboard.save_brand')}
            </button>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="panel-card text-center h-100">
                <p className="h3 font-weight-bold mb-1">{products.length}</p>
                <p className="small text-muted mb-0">{t('shop_dashboard.products')}</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="panel-card text-center h-100">
                <p className="h3 font-weight-bold mb-1">{orders.length}</p>
                <p className="small text-muted mb-0">{t('shop_dashboard.orders')}</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="panel-card text-center h-100">
                <p className="h3 font-weight-bold mb-1">{revenue.toFixed(2)} BHD</p>
                <p className="small text-muted mb-0">{t('shop_dashboard.revenue')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h2 className="h6 font-weight-bold text-uppercase text-muted mb-0">{t('shop_dashboard.recent_orders')}</h2>
        {orders.length ? <Link to="/shop/orders" className="btn btn-sm btn-outline-secondary">{t('shop_orders.view_all')}</Link> : null}
      </div>
      {!orders.length ? <p className="text-muted small">{t('shop_dashboard.no_orders')}</p> : null}
      {orders.slice(0, 10).map((o) => (
        <div key={o.id} className="panel-card mb-3">
          <div className="d-flex justify-content-between flex-wrap">
            <div>
              <p className="font-weight-bold mb-1">#{o.id.slice(0, 8)}</p>
              <p className="small text-muted mb-0">{o.customerName} · {formatDate(o.createdAt)}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <ul className="small pl-3 mt-2 mb-2">
            {o.items?.filter((i) => i.shopId === user.uid).map((item, i) => (
              <li key={i}>{item.name} × {item.quantity}</li>
            ))}
          </ul>
          <OrderTracker order={o} compact />
          <Link to={`/orders/${o.id}`} className="btn btn-sm btn-brand mt-2">{t('tracking.track')}</Link>
        </div>
      ))}
    </div>
  );
}
