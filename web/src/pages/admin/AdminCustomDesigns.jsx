import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OrderTracker from '../../components/OrderTracker.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useI18n, useT } from '../../i18n/I18nContext.jsx';
import { listCustomDesignOrders } from '../../services/orders.js';
import { MEASUREMENT_KEYS } from '../../data/measurements.js';

export default function AdminCustomDesigns() {
  const t = useT();
  const { lang } = useI18n();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    listCustomDesignOrders().then(setOrders);
  }, []);

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.custom_title')}</h1>
      {!orders.length ? <p className="text-muted">{t('admin.no_custom')}</p> : null}
      {orders.map((o) => (
        <div key={o.id} className="panel-card mb-3">
          <div className="d-flex justify-content-between flex-wrap mb-2">
            <div>
              <p className="font-weight-bold mb-1">{o.customerName}</p>
              <p className="small text-muted mb-0">{o.customerEmail} · {formatDate(o.createdAt)}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <div className="d-flex flex-wrap align-items-start mb-2" style={{ gap: '0.75rem' }}>
            {o.modelImageUrl ? (
              <img src={o.modelImageUrl} alt={o.modelName || ''} className="abaya-model-option__img" style={{ width: 72, height: 96 }} />
            ) : null}
            <div>
              {o.modelName ? <p className="small mb-1"><strong>{t('custom.models_title')}:</strong> {o.modelName}</p> : null}
              <p className="small mb-0"><strong>{t('custom.materials_title')}:</strong> {o.materialName} · <strong>{t('custom.colors_title')}:</strong> {o.colorName}</p>
            </div>
          </div>
          {o.notes ? <p className="small mb-2">{o.notes}</p> : null}
          <div className="row small mb-2">
            {MEASUREMENT_KEYS.map((k) => (
              <div key={k} className="col-6 col-md-3 mb-1">{k}: {o.measurements?.[k]} cm</div>
            ))}
          </div>
          {o.referenceImages?.length ? (
            <div className="d-flex flex-wrap mb-2" style={{ gap: '0.5rem' }}>
              {o.referenceImages.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                </a>
              ))}
            </div>
          ) : null}
          <OrderTracker order={o} compact />
          <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
            <p className="font-weight-bold mb-0">{o.total} {o.currency || 'BHD'}</p>
            <Link to={`/orders/${o.id}`} className="btn btn-sm btn-outline-secondary">{t('tracking.track')}</Link>
          </div>
          {o.payment?.reference ? <p className="small text-muted mb-0 mt-2">{t('confirmation.payment_ref', { ref: o.payment.reference })}</p> : null}
        </div>
      ))}
    </div>
  );
}
