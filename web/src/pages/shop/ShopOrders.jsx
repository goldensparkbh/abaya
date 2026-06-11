import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfigBanner from '../../components/ConfigBanner.jsx';
import OrderTracker from '../../components/OrderTracker.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n, useT } from '../../i18n/I18nContext.jsx';
import { listShopOrders } from '../../services/orders.js';
import { db } from '../../firebase.js';

export default function ShopOrders() {
  const t = useT();
  const { lang } = useI18n();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) return;
    listShopOrders(user.uid)
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

  return (
    <div className="container content-page px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h1 className="cart-page-title mb-0">{t('shop_orders.title')}</h1>
        <Link to="/shop/dashboard" className="btn btn-outline-secondary btn-sm">{t('nav.shop_dashboard')}</Link>
      </div>

      {loading ? <p className="text-muted">{t('common.loading')}</p> : null}
      {!loading && !orders.length ? (
        <div className="empty-state">
          <p className="text-muted">{t('shop_orders.empty')}</p>
        </div>
      ) : null}

      {orders.map((o) => {
        const myItems = o.items?.filter((i) => i.shopId === user.uid) || [];
        const shopTotal = myItems.reduce((n, i) => n + i.price * i.quantity, 0);
        return (
          <div key={o.id} className="panel-card mb-3">
            <div className="d-flex justify-content-between flex-wrap mb-2">
              <div>
                <p className="font-weight-bold mb-1">#{o.id.slice(0, 8)}</p>
                <p className="small text-muted mb-0">{o.customerName} · {formatDate(o.createdAt)}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <ul className="small pl-3 mb-3">
              {myItems.map((item, i) => (
                <li key={i}>{item.name} × {item.quantity}</li>
              ))}
            </ul>
            <OrderTracker order={o} compact />
            <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
              <span className="font-weight-bold">{shopTotal.toFixed(2)} BHD</span>
              <Link to={`/orders/${o.id}`} className="btn btn-sm btn-brand">
                {t('tracking.track')}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
