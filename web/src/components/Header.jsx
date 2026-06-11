import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

function NavItem({ to, end, children, soft }) {
  return (
    <NavLink
      end={end}
      to={to}
      className={({ isActive }) =>
        `site-header__link${soft ? ' site-header__link--soft' : ''}${isActive ? ' site-header__link--active' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const { user, profile, logout, firebaseReady } = useAuth();
  const { itemCount } = useCart();
  const t = useT();
  const [err, setErr] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  async function onLogout() {
    setErr('');
    try {
      await logout();
      setMenuOpen(false);
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    }
  }

  const role = profile?.role || 'customer';
  const isShop = role === 'shop' || role === 'business';
  const isAdmin = role === 'admin';
  const displayName = profile?.displayName || user?.displayName || t('common.you');

  const navLinks = [
    { to: '/', end: true, label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    ...(!isShop ? [{ to: '/custom-design', label: t('nav.custom_design') }] : []),
    ...(user ? [{ to: '/my-orders', label: t('nav.my_orders') }] : []),
    ...(isShop
      ? [
          { to: '/shop/dashboard', label: t('nav.shop_dashboard') },
          { to: '/shop/orders', label: t('nav.shop_orders') },
          { to: '/shop/products', label: t('nav.shop_products') },
        ]
      : []),
    ...(isAdmin ? [{ to: '/admin', label: t('nav.admin') }] : []),
    { to: '/about', label: t('nav.about'), soft: true },
    { to: '/contact', label: t('nav.contact'), soft: true },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__container">
        <div className="site-header__bar">
          <Link className="site-header__brand" to="/" onClick={() => setMenuOpen(false)}>
            <img src="/img/logo-01.svg" alt={t('app.name')} />
          </Link>

          <button
            type="button"
            className={`site-header__toggle${menuOpen ? ' is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="mainNav"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`site-header__menu${menuOpen ? ' is-open' : ''}`} id="mainNav">
            <nav className="site-header__nav" aria-label="Main">
              {navLinks.map((link) => (
                <NavItem key={link.to} to={link.to} end={link.end} soft={link.soft}>
                  {link.label}
                </NavItem>
              ))}
            </nav>

            <div className="site-header__actions">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `site-header__cart${isActive ? ' site-header__cart--active' : ''}`
                }
                title={t('nav.cart')}
                onClick={() => setMenuOpen(false)}
              >
                <i className="fa fa-shopping-bag" aria-hidden="true" />
                {itemCount > 0 ? <span className="site-header__cart-count">{itemCount}</span> : null}
                <span className="site-header__cart-label">{t('nav.cart')}</span>
              </NavLink>

              <LanguageSwitcher className="site-header__lang" />

              {!firebaseReady ? (
                <span className="site-header__hint">{t('nav.config_firebase')}</span>
              ) : !user ? (
                <div className="site-header__auth">
                  <Link className="site-header__auth-link" to="/login" onClick={() => setMenuOpen(false)}>
                    {t('nav.sign_in')}
                  </Link>
                  <Link
                    className="site-header__auth-btn"
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              ) : (
                <div className="site-header__user">
                  <span className="site-header__user-chip" title={displayName}>
                    <i className="fa fa-user-circle" aria-hidden="true" />
                    <span className="site-header__user-name">{displayName}</span>
                    {isShop ? (
                      <span className="site-header__user-role">{t('nav.role_shop')}</span>
                    ) : isAdmin ? (
                      <span className="site-header__user-role">{t('nav.role_admin')}</span>
                    ) : null}
                  </span>
                  <button type="button" className="site-header__logout" onClick={onLogout} title={t('nav.logout')}>
                    <i className="fa fa-sign-out" aria-hidden="true" />
                    <span className="site-header__logout-label">{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {err ? <div className="site-header__error">{err}</div> : null}
      </div>
    </header>
  );
}
