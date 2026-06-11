import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderTracker from '../components/OrderTracker.jsx';
import { getOrder } from '../services/orders.js';
import { db } from '../firebase.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function CustomDesignConfirmation() {
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
      <div className="confirmation-card panel-card text-center mx-auto" style={{ maxWidth: 680 }}>
        <div className="confirmation-card__icon confirmation-card__icon--success">
          <i className="fa fa-check-circle" aria-hidden="true" />
        </div>
        <h1 className="h3 font-weight-bold mb-3">{t('custom.confirm_title')}</h1>
        <p className="text-muted mb-4">{t('custom.confirm_body')}</p>
        <p className="small text-muted mb-1">{t('confirmation.order_id')}</p>
        <p className="font-weight-bold mb-4">{order.id}</p>
        {paid ? (
          <div className="text-left panel-card mb-4" style={{ background: 'var(--color-canvas)' }}>
            <OrderTracker order={order} />
          </div>
        ) : null}
        <div className="text-left panel-card mb-4" style={{ background: 'var(--color-canvas)' }}>
          {order.modelImageUrl ? (
            <img src={order.modelImageUrl} alt={order.modelName || ''} className="abaya-model-option__img mb-2" style={{ maxWidth: 100 }} />
          ) : null}
          {order.modelName ? <p className="small mb-1"><strong>{t('custom.models_title')}:</strong> {order.modelName}</p> : null}
          <p className="small mb-1"><strong>{t('custom.materials_title')}:</strong> {order.materialName}</p>
          <p className="small mb-1"><strong>{t('custom.colors_title')}:</strong> {order.colorName}</p>
          {order.notes ? <p className="small mb-0"><strong>{t('custom.notes')}:</strong> {order.notes}</p> : null}
        </div>
        {paid ? (
          <>
            <p className="h5 font-weight-bold mb-3" style={{ color: 'var(--color-primary)' }}>
              {order.total} {order.currency || 'BHD'} — {t('confirmation.paid_title')}
            </p>
            <p className="small text-muted mb-4">{t('custom.confirm_followup')}</p>
            <p className="small text-muted mb-4">{t('confirmation.email_sent')}</p>
          </>
        ) : null}
        <div className="d-flex justify-content-center flex-wrap" style={{ gap: '0.75rem' }}>
          {paid ? <Link to={`/orders/${order.id}`} className="btn btn-brand">{t('tracking.track')}</Link> : null}
          <Link to="/my-orders" className="btn btn-outline-secondary">{t('confirmation.view_orders')}</Link>
          <Link to="/shop" className="btn btn-outline-secondary">{t('confirmation.continue_shopping')}</Link>
        </div>
      </div>
    </div>
  );
}
