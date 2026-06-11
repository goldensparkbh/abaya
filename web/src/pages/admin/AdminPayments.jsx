import React, { useEffect, useState } from 'react';
import { useI18n, useT } from '../../i18n/I18nContext.jsx';
import { listPayments } from '../../services/orders.js';

export default function AdminPayments() {
  const t = useT();
  const { lang } = useI18n();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    listPayments().then(setPayments);
  }, []);

  const formatDate = (ts) => {
    if (!ts) return '';
    if (ts?.toDate) return ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en');
    return new Date(ts).toLocaleString(lang === 'ar' ? 'ar' : 'en');
  };

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.payments_title')}</h1>
      {!payments.length ? <p className="text-muted">{t('admin.no_payments')}</p> : null}
      <div className="table-responsive panel-card">
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th>{t('admin.col_order')}</th>
              <th>{t('admin.col_customer')}</th>
              <th>{t('admin.col_type')}</th>
              <th>{t('admin.col_amount')}</th>
              <th>{t('admin.col_status')}</th>
              <th>{t('admin.col_date')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.orderId + p.reference}>
                <td className="small">#{p.orderId.slice(0, 8)}</td>
                <td className="small">{p.customerName}</td>
                <td className="small">{p.orderType === 'custom_design' ? t('orders.custom_design') : t('orders.shop_order')}</td>
                <td>{p.amount} {p.currency}</td>
                <td><span className="status-badge badge-done">{p.status}</span></td>
                <td className="small">{formatDate(p.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
