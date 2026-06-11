import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OrderTracker from '../../components/OrderTracker.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useI18n, useT } from '../../i18n/I18nContext.jsx';
import { listAllOrders, updateOrderStatus } from '../../services/orders.js';

export default function AdminOrders() {
  const t = useT();
  const { lang } = useI18n();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  async function load() {
    setOrders(await listAllOrders());
  }

  useEffect(() => { load(); }, []);

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.type === filter);

  async function setStatus(id, status) {
    await updateOrderStatus(id, status, { by: 'admin' });
    await load();
  }

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.orders_title')}</h1>
      <div className="mb-3 d-flex flex-wrap" style={{ gap: '0.5rem' }}>
        {['all', 'product', 'custom_design'].map((f) => (
          <button key={f} type="button" className={`btn btn-sm ${filter === f ? 'btn-brand' : 'btn-outline-secondary'}`} onClick={() => setFilter(f)}>
            {t(`admin.filter_${f}`)}
          </button>
        ))}
      </div>
      {filtered.map((o) => (
        <div key={o.id} className="panel-card mb-3">
          <div className="d-flex justify-content-between flex-wrap mb-2">
            <div>
              <p className="font-weight-bold mb-1">#{o.id.slice(0, 10)} — {o.customerName}</p>
              <p className="small text-muted mb-0">{formatDate(o.createdAt)} · {o.customerEmail}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          {o.type === 'product' ? (
            <ul className="small pl-3 mb-2">
              {o.items?.map((item, i) => <li key={i}>{item.name} × {item.quantity} ({item.shopName})</li>)}
            </ul>
          ) : (
            <p className="small mb-2">{o.materialName} · {o.colorName}</p>
          )}
          <OrderTracker order={o} compact />
          <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
            <span className="font-weight-bold">{o.total} {o.currency || 'BHD'}</span>
            <div className="d-flex flex-wrap align-items-center" style={{ gap: '0.5rem' }}>
              <select className="form-control form-control-sm" style={{ width: 160 }} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                <option value="paid">{t('admin.status_paid')}</option>
                <option value="processing">{t('admin.status_processing')}</option>
                <option value="shipped">{t('admin.status_shipped')}</option>
                <option value="delivered">{t('admin.status_delivered')}</option>
                <option value="cancelled">{t('admin.status_cancelled')}</option>
              </select>
              <Link to={`/orders/${o.id}`} className="btn btn-sm btn-outline-secondary">
                {t('tracking.track')}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
