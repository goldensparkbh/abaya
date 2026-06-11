import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n, useT } from '../i18n/I18nContext.jsx';
import { subscribeOpenRequests } from '../services/bidding.js';
import { db } from '../firebase.js';

export default function BrowseRequests() {
  const t = useT();
  const { lang } = useI18n();
  const { user, profile, firebaseReady } = useAuth();
  const [rows, setRows] = useState([]);

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');

  useEffect(() => {
    if (!user || !db) return undefined;
    return subscribeOpenRequests(setRows);
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
          <h2 className="h4 mb-3">{t('browse.sign_in_title')}</h2>
          <Link to="/login" className="btn btn-brand px-4">
            {t('login.submit')}
          </Link>
        </div>
      </div>
    );
  }

  const role = profile?.role;
  const isShop = role === 'shop' || role === 'business';

  return (
    <div className="container content-page px-3 px-md-4">
      <header className="section-header text-center text-md-left mb-4">
        <p className="section-header__eyebrow">{t('browse.eyebrow')}</p>
        <h1 className="section-header__title">{t('browse.title')}</h1>
        <p className="section-header__subtitle">{isShop ? t('browse.lead_shop') : t('browse.lead_customer')}</p>
      </header>

      {!rows.length ? (
        <p className="text-muted">{t('browse.empty')}</p>
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
                  {(r.description || '').slice(0, 110)}
                  {(r.description || '').length > 110 ? '…' : ''}
                </p>
                <p className="small mb-1">
                  <strong>{t(`fabric.${r.fabric}`)}</strong> · {t(`color.${r.color}`)} · {t('common.qty')} {r.quantity}
                </p>
                <p className="small mb-2">
                  {t('browse.bids_so_far')} <strong>{r.bidCount || 0}</strong>
                  {r.budgetMin || r.budgetMax ? (
                    <span className="text-muted"> · {t('browse.budget', { min: r.budgetMin || '—', max: r.budgetMax || '—' })}</span>
                  ) : null}
                </p>
                <p className="small text-muted mb-0">{t('common.posted')} {formatDate(r.createdAt)}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
