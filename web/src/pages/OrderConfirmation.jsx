import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderTracker from '../components/OrderTracker.jsx';
import { getOrder } from '../services/orders.js';
import { db } from '../firebase.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function OrderConfirmation() {
  const { id } = useParams();
  const t = useT();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (db && id) getOrder(id).then(setOrder);
  }, [id]);

  if (!order) {
    return (
      <div className="container content-page">
        <p className="text-muted">{t('common.loading')}</p>
      </div>
    );
  }

  const paid = order.status === 'paid' || order.payment?.status === 'captured';

  return (
    <div className="container content-page px-3 px-md-4">
      <div className="confirmation-card panel-card text-center mx-auto" style={{ maxWidth: 640 }}>
        <div className={`confirmation-card__icon ${paid ? 'confirmation-card__icon--success' : ''}`}>
          <i className={`fa ${paid ? 'fa-check-circle' : 'fa-clock-o'}`} aria-hidden="true" />
        </div>
        <h1 className="h3 font-weight-bold mb-3">
          {paid ? t('confirmation.paid_title') : t('confirmation.pending_title')}
        </h1>
        <p className="text-muted mb-4">
          {paid ? t('confirmation.paid_body') : t('confirmation.pending_body')}
        </p>
        <p className="small text-muted mb-1">{t('confirmation.order_id')}</p>
        <p className="font-weight-bold mb-4">{order.id}</p>
        {paid ? (
          <div className="text-left mb-4">
            <OrderTracker order={order} />
          </div>
        ) : null}
        <p className="h5 font-weight-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          {order.total} {order.currency || 'BHD'}
        </p>
        {order.payment?.reference ? (
          <p className="small text-muted mb-4">
            {t('confirmation.payment_ref', { ref: order.payment.reference })}
          </p>
        ) : null}
        <p className="small text-muted mb-4">{t('confirmation.email_sent')}</p>
        <div className="d-flex justify-content-center flex-wrap" style={{ gap: '0.75rem' }}>
          {paid ? <Link to={`/orders/${order.id}`} className="btn btn-brand">{t('tracking.track')}</Link> : null}
          <Link to="/my-orders" className="btn btn-outline-secondary">{t('confirmation.view_orders')}</Link>
          <Link to="/shop" className="btn btn-outline-secondary">{t('confirmation.continue_shopping')}</Link>
        </div>
      </div>
    </div>
  );
}
