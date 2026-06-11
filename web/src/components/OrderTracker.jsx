import React from 'react';
import { TRACKING_STEPS, buildFallbackHistory, getStepTimestamp, trackingStepIndex } from '../data/orderTracking.js';
import { ORDER_STATUS } from '../services/orders.js';
import { useI18n, useT } from '../i18n/I18nContext.jsx';

const STEP_KEYS = {
  paid: 'step_paid',
  processing: 'step_processing',
  shipped: 'step_shipped',
  delivered: 'step_delivered',
};

export default function OrderTracker({ order, compact = false }) {
  const t = useT();
  const { lang } = useI18n();
  const status = order?.status || ORDER_STATUS.PENDING_PAYMENT;
  const history = buildFallbackHistory(order);
  const currentIdx = trackingStepIndex(status);

  const formatDate = (ts) => {
    if (!ts?.toDate) return null;
    return ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <div className={`order-tracker order-tracker--cancelled${compact ? ' order-tracker--compact' : ''}`}>
        <p className="small text-danger mb-0 font-weight-bold">{t('tracking.cancelled')}</p>
      </div>
    );
  }

  if (status === ORDER_STATUS.PENDING_PAYMENT) {
    return (
      <div className={`order-tracker order-tracker--pending${compact ? ' order-tracker--compact' : ''}`}>
        <p className="small text-muted mb-0">{t('tracking.pending_payment')}</p>
      </div>
    );
  }

  return (
    <div className={`order-tracker${compact ? ' order-tracker--compact' : ''}`} aria-label={t('tracking.title')}>
      {!compact ? <p className="order-tracker__title small font-weight-bold text-uppercase text-muted mb-3">{t('tracking.title')}</p> : null}
      <ol className="order-tracker__steps">
        {TRACKING_STEPS.map((step, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i;
          const ts = getStepTimestamp(history, step);
          const dateLabel = formatDate(ts);

          return (
            <li
              key={step}
              className={`order-tracker__step${done ? ' order-tracker__step--done' : ''}${active ? ' order-tracker__step--active' : ''}`}
            >
              <span className="order-tracker__dot" aria-hidden="true">
                {done ? <i className="fa fa-check" /> : i + 1}
              </span>
              <div className="order-tracker__label">
                <span className="order-tracker__name">{t(`tracking.${STEP_KEYS[step]}`)}</span>
                {!compact && dateLabel ? <span className="order-tracker__date">{dateLabel}</span> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
