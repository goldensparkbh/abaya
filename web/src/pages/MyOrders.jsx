import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import OrderTracker from '../components/OrderTracker.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n, useT } from '../i18n/I18nContext.jsx';
import { listCustomerOrders } from '../services/orders.js';
import { db } from '../firebase.js';

export default function MyOrders() {
  const t = useT();
  const { lang } = useI18n();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) return;
    listCustomerOrders(user.uid)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');

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
          <h2 className="h4 mb-3">{t('orders.sign_in_title')}</h2>
          <Link to="/login" className="btn btn-brand">{t('login.submit')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <h1 className="cart-page-title mb-4">{t('orders.title')}</h1>
      {loading ? <p className="text-muted">{t('common.loading')}</p> : null}
      {!loading && !orders.length ? (
        <div className="empty-state">
          <p className="text-muted mb-4">{t('orders.empty')}</p>
          <Link to="/shop" className="btn btn-brand">{t('cart.browse')}</Link>
        </div>
      ) : null}
      {orders.map((o) => (
        <div key={o.id} className="panel-card mb-3">
          <div className="d-flex justify-content-between flex-wrap mb-2">
            <div>
              <p className="font-weight-bold mb-1">
                {o.type === 'custom_design' ? t('orders.custom_design') : t('orders.shop_order')}
              </p>
              <p className="small text-muted mb-0">{formatDate(o.createdAt)}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          {o.type === 'product' ? (
            <ul className="small pl-3 mb-2">
              {o.items?.map((item, i) => (
                <li key={i}>{item.name} × {item.quantity} — {item.shopName}</li>
              ))}
            </ul>
          ) : (
            <p className="small mb-2">{o.materialName} · {o.colorName}</p>
          )}
          <OrderTracker order={o} compact />
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="font-weight-bold">{o.total} {o.currency || 'BHD'}</span>
            <Link to={`/orders/${o.id}`} className="btn btn-sm btn-brand">
              {t('tracking.track')}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
