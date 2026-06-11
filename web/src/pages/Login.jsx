import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import ConfigBanner from '../components/ConfigBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';
import { auth, db } from '../firebase.js';

function routeForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'business' || role === 'shop') return '/browse';
  return '/my-requests';
}

export default function Login() {
  const t = useT();
  const { login, firebaseReady } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      const uid = auth.currentUser?.uid;
      if (!uid || !db) {
        nav('/');
        return;
      }
      const snap = await getDoc(doc(db, 'users', uid));
      const role = snap.exists() ? snap.data().role || 'customer' : 'customer';
      nav(routeForRole(role));
    } catch (ex) {
      setErr(ex.message || t('login.error_default'));
    }
  }

  return (
    <>
      <ConfigBanner />
      <section className="auth-page">
        <form className="auth-card mx-auto text-left" onSubmit={onSubmit}>
          <p className="h4 mb-2 text-center">{t('login.title')}</p>
          <p className="small text-muted text-center mb-4">{t('login.subtitle')}</p>
          {!firebaseReady ? <p className="text-danger small text-center">{t('login.not_configured')}</p> : null}
          {err ? <p className="text-danger small text-center">{err}</p> : null}
          <label className="small font-weight-bold text-muted" htmlFor="login-email">
            {t('login.email_label')}
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            className="form-control mb-3"
            placeholder={t('login.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <label className="small font-weight-bold text-muted" htmlFor="login-password">
            {t('login.password_label')}
          </label>
          <div className="position-relative mb-4">
            <input
              id="login-password"
              type={show ? 'text' : 'password'}
              name="password"
              className="form-control pr-5"
              placeholder={t('login.password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <i
              className="fas fa-eye text-muted password-toggle-icon"
              role="button"
              tabIndex={0}
              aria-label="Toggle password visibility"
              onClick={() => setShow((s) => !s)}
              onKeyDown={(e) => e.key === 'Enter' && setShow((s) => !s)}
              style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
            />
          </div>
          <button className="btn btn-submit btn-block py-2" type="submit" disabled={!firebaseReady}>
            {t('login.submit')}
          </button>
          <p className="small text-center text-muted mt-4 mb-0">
            {t('login.new_customer')} <Link to="/register">{t('login.register_link')}</Link>
          </p>
          <p className="small text-muted mt-3 mb-0" style={{ lineHeight: 1.5 }}>
            {t('login.staff_note')}
          </p>
        </form>
      </section>
    </>
  );
}
