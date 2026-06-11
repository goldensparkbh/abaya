import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ColorSwatches from '../components/ColorSwatches.jsx';
import ConfigBanner from '../components/ConfigBanner.jsx';
import OrderTracker from '../components/OrderTracker.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ADMIN_STATUS_OPTIONS, SHOP_STATUS_OPTIONS } from '../data/orderTracking.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n, useT } from '../i18n/I18nContext.jsx';
import usePlatformColors from '../hooks/usePlatformColors.js';
import {
  getOrder,
  updateOrderStatus,
  updateShopOrderStatus,
} from '../services/orders.js';
import { db } from '../firebase.js';

export default function OrderDetail() {
  const { id } = useParams();
  const t = useT();
  const { lang } = useI18n();
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const { lookup } = usePlatformColors();
  const [order, setOrder] = useState(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const role = profile?.role || 'customer';
  const isAdmin = role === 'admin';
  const isShop = role === 'shop' || role === 'business';

  async function load() {
    if (!db || !id) return;
    const o = await getOrder(id);
    setOrder(o);
    if (o) setStatusDraft(o.status);
  }

  useEffect(() => { load(); }, [id]);

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container content-page">
        <div className="empty-state">
          <Link to="/login" className="btn btn-brand">{t('login.submit')}</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container content-page">
        <p className="text-muted">{t('common.loading')}</p>
      </div>
    );
  }

  const isCustomer = order.customerId === user.uid;
  const shopItems = isShop ? order.items?.filter((i) => i.shopId === user.uid) || [] : [];
  const canView = isCustomer || isAdmin || (isShop && shopItems.length);
  const canUpdate = isAdmin || (isShop && order.type === 'product' && shopItems.length);
  const statusOptions = isAdmin ? ADMIN_STATUS_OPTIONS : SHOP_STATUS_OPTIONS;

  if (!canView) {
    return (
      <div className="container content-page">
        <p className="text-muted">{t('tracking.no_access')}</p>
        <Link to="/" className="btn btn-outline-secondary">{t('nav.home')}</Link>
      </div>
    );
  }

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');

  async function saveStatus(e) {
    e.preventDefault();
    if (!statusDraft || statusDraft === order.status) return;
    setBusy(true);
    setErr('');
    try {
      if (isAdmin) {
        await updateOrderStatus(order.id, statusDraft, { by: 'admin' });
      } else {
        await updateShopOrderStatus(order.id, user.uid, statusDraft);
      }
      await load();
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  const backTo = isAdmin ? '/admin/orders' : isShop ? '/shop/orders' : '/my-orders';

  return (
    <div className="container content-page px-3 px-md-4">
      <nav className="mb-3 small">
        <Link to={backTo}>{t('orders.title')}</Link>
        <span className="mx-2">/</span>
        <span>#{order.id.slice(0, 8)}</span>
      </nav>

      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4">
        <div>
          <h1 className="h4 font-weight-bold mb-1">{t('tracking.order_details')}</h1>
          <p className="small text-muted mb-0">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}

      <div className="row">
        <div className="col-lg-7 mb-4">
          <div className="panel-card mb-4">
            <OrderTracker order={order} />
          </div>

          <div className="panel-card">
            <h2 className="h6 font-weight-bold mb-3">
              {order.type === 'custom_design' ? t('orders.custom_design') : t('orders.shop_order')}
            </h2>
            {order.type === 'product' ? (
              <ul className="list-unstyled mb-0">
                {(isShop ? shopItems : order.items)?.map((item, i) => (
                  <li key={i} className="d-flex align-items-center mb-3">
                    <img
                      src={item.image || '/img/placeholder-product.svg'}
                      alt=""
                      style={{ width: 56, height: 68, objectFit: 'cover', borderRadius: 8 }}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-weight-bold mb-1">{item.name}</p>
                      <p className="small text-muted mb-1">{item.shopName}</p>
                      <p className="small mb-0">
                        × {item.quantity}
                        {item.size ? ` · ${t('product.size')}: ${item.size}` : ''}
                      </p>
                      {item.color ? (
                        <div className="d-flex align-items-center small mt-1" style={{ gap: '0.35rem' }}>
                          <span>{t('product.color')}:</span>
                          <ColorSwatches colors={[item.color]} lookup={lookup} size="sm" readOnly />
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="small">
                {order.modelImageUrl ? (
                  <img src={order.modelImageUrl} alt="" className="abaya-model-option__img mb-2" style={{ maxWidth: 100 }} />
                ) : null}
                {order.modelName ? <p className="mb-1"><strong>{t('custom.models_title')}:</strong> {order.modelName}</p> : null}
                <p className="mb-1"><strong>{t('custom.materials_title')}:</strong> {order.materialName}</p>
                <p className="mb-1"><strong>{t('custom.colors_title')}:</strong> {order.colorName}</p>
                {order.notes ? <p className="mb-0"><strong>{t('custom.notes')}:</strong> {order.notes}</p> : null}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="panel-card mb-4">
            <h2 className="h6 font-weight-bold mb-3">{t('tracking.summary')}</h2>
            <p className="small mb-1"><strong>{t('confirmation.order_id')}:</strong> {order.id}</p>
            {(isShop || isAdmin) && !isCustomer ? (
              <>
                <p className="small mb-1"><strong>{t('admin.col_customer')}:</strong> {order.customerName}</p>
                <p className="small mb-1">{order.customerEmail}</p>
                {order.customerMobile ? <p className="small mb-1">{order.customerMobile}</p> : null}
              </>
            ) : null}
            {order.shippingAddress ? (
              <p className="small mb-2">
                <strong>{t('checkout.shipping')}:</strong>{' '}
                {[order.shippingAddress.line1, order.shippingAddress.city, order.shippingAddress.country].filter(Boolean).join(', ')}
              </p>
            ) : null}
            <p className="h5 font-weight-bold mb-0" style={{ color: 'var(--color-primary)' }}>
              {order.total} {order.currency || 'BHD'}
            </p>
          </div>

          {canUpdate ? (
            <form onSubmit={saveStatus} className="panel-card">
              <h2 className="h6 font-weight-bold mb-3">{t('tracking.update_status')}</h2>
              <div className="form-group">
                <select
                  className="form-control"
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{t(`status.${s}`)}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-brand btn-block" disabled={busy || statusDraft === order.status}>
                {busy ? t('common.loading') : t('tracking.save_status')}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <button type="button" className="btn btn-outline-secondary" onClick={() => nav(backTo)}>
        {t('common.back')}
      </button>
    </div>
  );
}
