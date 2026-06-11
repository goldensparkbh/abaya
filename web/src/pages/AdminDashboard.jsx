import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n, useT } from '../i18n/I18nContext.jsx';
import { listAllDisputes, resolveDispute } from '../services/bidding.js';
import { db } from '../firebase.js';

export default function AdminDashboard() {
  const t = useT();
  const { lang } = useI18n();
  const { user, profile, firebaseReady } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({});

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString(lang === 'ar' ? 'ar' : 'en') : '');

  async function load() {
    setLoading(true);
    try {
      const rows = await listAllDisputes();
      rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setDisputes(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && db) load();
  }, [user]);

  if (!firebaseReady || !db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="container content-page">
        <div className="empty-state">
          <h2 className="h4 mb-3">{t('admin.only_title')}</h2>
          <p className="text-muted">{t('admin.only_body')}</p>
        </div>
      </div>
    );
  }

  async function resolve(d, decision) {
    const ok = window.confirm(decision === 'release' ? t('admin.confirm_release') : t('admin.confirm_refund'));
    if (!ok) return;
    try {
      await resolveDispute(d.requestId, d.id, {
        adminId: user.uid,
        decision,
        note: note[d.id] || '',
      });
      await load();
    } catch (e) {
      alert(e.message || t('admin.resolve_err'));
    }
  }

  const open = disputes.filter((d) => d.status === 'open');
  const closed = disputes.filter((d) => d.status !== 'open');

  const roleLabel = (role) => {
    if (role === 'shop' || role === 'business') return t('common.shop');
    if (role === 'admin') return t('common.admin');
    return t('common.customer');
  };

  return (
    <div className="container content-page px-3 px-md-4">
      <h1 className="cart-page-title mb-4">{t('admin.title')}</h1>

      <section className="mb-5">
        <h2 className="h6 font-weight-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.08em' }}>
          {t('admin.open_section', { n: open.length })}
        </h2>
        {loading ? <p className="text-muted">{t('common.loading')}</p> : null}
        {!loading && !open.length ? <p className="text-muted small">{t('admin.no_open')}</p> : null}
        {open.map((d) => (
          <div key={d.id} className="panel-card mb-3">
            <div className="d-flex justify-content-between flex-wrap mb-2">
              <div>
                <Link to={`/requests/${d.requestId}`} className="font-weight-bold">
                  {t('request.request_id', { id: d.requestId.slice(0, 8) })}
                </Link>
                <p className="small text-muted mb-0">
                  {t('admin.raised_by', { name: d.raisedByName, role: roleLabel(d.raisedByRole), date: formatDate(d.createdAt) })}
                </p>
              </div>
              <span className="status-badge badge-warn">{t('status.open')}</span>
            </div>
            <p className="mb-3">{d.reason}</p>
            <textarea
              className="form-control mb-3"
              rows={2}
              placeholder={t('admin.note_placeholder')}
              value={note[d.id] || ''}
              onChange={(e) => setNote((n) => ({ ...n, [d.id]: e.target.value }))}
            />
            <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
              <button type="button" className="btn btn-brand" onClick={() => resolve(d, 'release')}>
                {t('admin.resolve_release')}
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={() => resolve(d, 'refund')}>
                {t('admin.resolve_refund')}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="h6 font-weight-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.08em' }}>
          {t('admin.resolved_section', { n: closed.length })}
        </h2>
        {!closed.length ? <p className="text-muted small">{t('admin.no_history')}</p> : null}
        {closed.map((d) => (
          <div key={d.id} className="panel-card mb-3">
            <div className="d-flex justify-content-between flex-wrap mb-2">
              <Link to={`/requests/${d.requestId}`} className="font-weight-bold">
                {t('request.request_id', { id: d.requestId.slice(0, 8) })}
              </Link>
              <span className={`status-badge ${d.status === 'resolved_release' ? 'badge-done' : 'badge-muted'}`}>
                {d.status === 'resolved_release' ? t('admin.resolve_release') : t('admin.resolve_refund')}
              </span>
            </div>
            <p className="mb-1">{d.reason}</p>
            {d.resolution ? <p className="small text-muted mb-0">{t('admin.resolution_note', { note: d.resolution })}</p> : null}
            <p className="small text-muted mb-0">{t('admin.resolved_on', { date: formatDate(d.resolvedAt) })}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
