import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n, useT } from '../i18n/I18nContext.jsx';
import { subscribeMyRequests } from '../services/bidding.js';
import { db } from '../firebase.js';

function useFormatDate() {
  const { lang } = useI18n();
  return (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');
}

export default function MyRequests() {
  const t = useT();
  const { user, firebaseReady } = useAuth();
  const [rows, setRows] = useState([]);
  const formatDate = useFormatDate();

  useEffect(() => {
    if (!user || !db) return undefined;
    return subscribeMyRequests(user.uid, setRows);
  }, [user]);

  if (!firebaseReady || !db) {
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
          <h2 className="h4 mb-3">{t('my_requests.sign_in_title')}</h2>
          <Link to="/login" className="btn btn-brand px-4">
            {t('login.submit')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h1 className="cart-page-title mb-2 mb-md-0">{t('my_requests.title')}</h1>
        <Link to="/post" className="btn btn-brand">
          {t('my_requests.new_btn')}
        </Link>
      </div>
      {!rows.length ? (
        <div className="empty-state border rounded-card bg-white py-5" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-muted mb-3">{t('my_requests.empty_title')}</p>
          <Link to="/post" className="btn btn-brand px-4">
            {t('my_requests.empty_cta')}
          </Link>
        </div>
      ) : (
        <div className="row">
          {rows.map((r) => (
            <div key={r.id} className="col-md-6 col-lg-4 mb-4">
              <Link to={`/requests/${r.id}`} className="request-card d-block h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h2 className="h6 font-weight-bold mb-0">{r.title}</h2>
                  <StatusBadge status={r.status} />
                </div>
                <p className="small text-muted mb-2" style={{ minHeight: '2.5rem' }}>
                  {(r.description || '').slice(0, 90)}
                  {(r.description || '').length > 90 ? '…' : ''}
                </p>
                <p className="small mb-1">
                  <strong>{t(`fabric.${r.fabric}`)}</strong> · {t(`color.${r.color}`)} · {t('common.qty')} {r.quantity}
                </p>
                <p className="small mb-2">
                  {t('my_requests.bids_count')} <strong>{r.bidCount || 0}</strong>
                  {r.awardedShopName ? <span className="text-muted"> · {t('my_requests.awarded_to', { name: r.awardedShopName })}</span> : null}
                </p>
                <p className="small text-muted mb-0">{formatDate(r.createdAt)}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
