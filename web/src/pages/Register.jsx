import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';

export default function Register() {
  const t = useT();
  const { registerAccount, firebaseReady } = useAuth();
  const nav = useNavigate();
  const [accountType, setAccountType] = useState('customer');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (password !== confirm) {
      setErr(t('register.mismatch'));
      return;
    }
    setBusy(true);
    try {
      await registerAccount({
        email,
        password,
        name,
        mobile,
        role: accountType === 'shop' ? 'business' : 'customer',
        shopName: accountType === 'shop' ? shopName : undefined,
      });
      alert(t('register.success_alert'));
      nav('/login');
    } catch (ex) {
      setErr(ex.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ConfigBanner />
      <section className="auth-page">
        <form className="auth-card mx-auto text-left" style={{ maxWidth: 520 }} onSubmit={onSubmit}>
          <p className="h4 mb-2 text-center">{t('register.title')}</p>
          <p className="small text-muted text-center mb-4">{t('register.subtitle')}</p>

          <div className="role-toggle mb-4">
            <button
              type="button"
              className={`role-toggle__btn ${accountType === 'customer' ? 'is-active' : ''}`}
              onClick={() => setAccountType('customer')}
            >
              <strong>{t('register.type_customer_title')}</strong>
              <span>{t('register.type_customer_sub')}</span>
            </button>
            <button
              type="button"
              className={`role-toggle__btn ${accountType === 'shop' ? 'is-active' : ''}`}
              onClick={() => setAccountType('shop')}
            >
              <strong>{t('register.type_shop_title')}</strong>
              <span>{t('register.type_shop_sub')}</span>
            </button>
          </div>

          {!firebaseReady ? <p className="text-danger small text-center">{t('register.not_configured')}</p> : null}
          {err ? <p className="text-danger small text-center">{err}</p> : null}

          <label className="size-input__label" htmlFor="reg-name">
            {accountType === 'shop' ? t('register.name_label_shop') : t('register.name_label')}
          </label>
          <input id="reg-name" type="text" className="form-control mb-3" placeholder={t('register.name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} required />

          {accountType === 'shop' ? (
            <>
              <label className="size-input__label" htmlFor="reg-shop">
                {t('register.shop_name_label')}
              </label>
              <input id="reg-shop" type="text" className="form-control mb-3" placeholder={t('register.shop_name_placeholder')} value={shopName} onChange={(e) => setShopName(e.target.value)} required />
            </>
          ) : null}

          <label className="size-input__label" htmlFor="reg-email">
            {t('register.email_label')}
          </label>
          <input id="reg-email" type="email" className="form-control mb-3" placeholder={t('register.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />

          <label className="size-input__label" htmlFor="reg-mobile">
            {t('register.mobile_label')}
          </label>
          <input id="reg-mobile" type="tel" className="form-control mb-3" placeholder={t('register.mobile_placeholder')} value={mobile} onChange={(e) => setMobile(e.target.value)} autoComplete="tel" required />

          <label className="size-input__label" htmlFor="reg-password">
            {t('register.password_label')}
          </label>
          <div className="position-relative mb-3">
            <input
              id="reg-password"
              type={show1 ? 'text' : 'password'}
              className="form-control pr-5"
              placeholder={t('register.password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <i
              className="fas fa-eye text-muted password-toggle-icon"
              role="button"
              tabIndex={0}
              aria-label="Toggle password visibility"
              onClick={() => setShow1((s) => !s)}
              style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
            />
          </div>

          <label className="size-input__label" htmlFor="reg-confirm">
            {t('register.confirm_label')}
          </label>
          <div className="position-relative mb-4">
            <input
              id="reg-confirm"
              type={show2 ? 'text' : 'password'}
              className="form-control pr-5"
              placeholder={t('register.confirm_placeholder')}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            <i
              className="fas fa-eye text-muted password-toggle-icon"
              role="button"
              tabIndex={0}
              aria-label="Toggle confirm password visibility"
              onClick={() => setShow2((s) => !s)}
              style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
            />
          </div>

          <button className="btn btn-submit btn-block py-2" type="submit" disabled={!firebaseReady || busy}>
            {busy ? t('register.creating') : accountType === 'shop' ? t('register.create_shop') : t('register.create_customer')}
          </button>

          <p className="small text-center text-muted mt-4 mb-0">
            {t('register.already')} <Link to="/login">{t('register.sign_in_link')}</Link>
          </p>
        </form>
      </section>
    </>
  );
}
