import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n, useT } from '../i18n/I18nContext.jsx';
import { listBidsForShop, subscribeAwardedRequestsForShop } from '../services/bidding.js';
import { db } from '../firebase.js';

export default function MyBids() {
  const t = useT();
  const { lang } = useI18n();
  const { user, profile, firebaseReady } = useAuth();
  const [bids, setBids] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');

  useEffect(() => {
    if (!user || !db) return undefined;
    listBidsForShop(user.uid)
      .then(setBids)
      .finally(() => setLoading(false));
    return subscribeAwardedRequestsForShop(user.uid, setActive);
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
          <h2 className="h4 mb-3">{t('login.title')}</h2>
          <Link to="/login" className="btn btn-brand px-4">
            {t('login.submit')}
          </Link>
        </div>
      </div>
    );
  }

  const role = profile?.role;
  if (role !== 'shop' && role !== 'business' && role !== 'admin') {
    return (
      <div className="container content-page">
        <div className="empty-state">
          <h2 className="h4 mb-3">{t('my_bids.shop_only_title')}</h2>
          <p className="text-muted">{t('my_bids.shop_only_body')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <h1 className="cart-page-title mb-4">{t('my_bids.title')}</h1>

      <section className="mb-5">
        <h2 className="h6 font-weight-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.08em' }}>
          {t('my_bids.active_title')}
        </h2>
        {!active.length ? (
          <p className="text-muted small">{t('my_bids.active_empty')}</p>
        ) : (
          <div className="row">
            {active.map((r) => (
              <div key={r.id} className="col-md-6 mb-3">
                <Link to={`/requests/${r.id}`} className="request-card d-block h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="h6 font-weight-bold mb-0">{r.title}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="small mb-1">
                    {t('my_bids.awarded_at', { price: r.awardedPrice, days: r.awardedLeadTimeDays })}
                  </p>
                  <p className="small text-muted mb-0">{t('my_bids.updated', { time: formatDate(r.updatedAt) })}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="h6 font-weight-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.08em' }}>
          {t('my_bids.bids_title')}
        </h2>
        {loading ? <p className="text-muted">{t('common.loading')}</p> : null}
        {!loading && !bids.length ? <p className="text-muted small">{t('my_bids.bids_empty')}</p> : null}
        {bids.length ? (
          <div className="table-responsive">
            <table className="table table-borderless align-middle bids-table">
              <thead>
                <tr className="cart-header-tb">
                  <th>{t('my_bids.th_request')}</th>
                  <th>{t('my_bids.th_price')}</th>
                  <th>{t('my_bids.th_lead')}</th>
                  <th>{t('my_bids.th_status')}</th>
                  <th>{t('my_bids.th_placed')}</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b) => (
                  <tr key={`${b.requestId}-${b.id}`}>
                    <td>
                      <Link to={`/requests/${b.requestId}`}>#{b.requestId.slice(0, 6)}…</Link>
                    </td>
                    <td>
                      <strong>{b.price} {t('common.bhd')}</strong>
                    </td>
                    <td>{b.leadTimeDays} {t('common.days')}</td>
                    <td>
                      <span className={`status-badge ${b.status === 'awarded' ? 'badge-awarded' : b.status === 'withdrawn' ? 'badge-muted' : 'badge-progress'}`}>
                        {t(`status.${b.status}`)}
                      </span>
                    </td>
                    <td className="small text-muted">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
