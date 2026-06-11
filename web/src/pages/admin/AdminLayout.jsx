import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import ConfigBanner from '../../components/ConfigBanner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useT } from '../../i18n/I18nContext.jsx';
import { db } from '../../firebase.js';

const NAV = [
  { to: '/admin', end: true, key: 'overview' },
  { to: '/admin/shops', key: 'shops' },
  { to: '/admin/orders', key: 'orders' },
  { to: '/admin/custom-designs', key: 'custom_designs' },
  { to: '/admin/payments', key: 'payments' },
  { to: '/admin/materials', key: 'materials' },
  { to: '/admin/colors', key: 'colors' },
  { to: '/admin/models', key: 'models' },
  { to: '/admin/measurement-guide', key: 'measurement_guide' },
  { to: '/admin/payment-gateway', key: 'payment_gateway' },
  { to: '/admin/emails', key: 'emails' },
  { to: '/admin/whatsapp', key: 'whatsapp' },
  { to: '/admin/users', key: 'users' },
];

export default function AdminLayout() {
  const t = useT();
  const { user, profile } = useAuth();

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-shell">
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="row">
          <aside className="col-lg-3 mb-4 mb-lg-0">
            <div className="admin-sidebar panel-card">
              <h2 className="h6 font-weight-bold text-uppercase text-muted mb-3">{t('admin.nav_title')}</h2>
              <nav className="admin-nav">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`}
                  >
                    {t(`admin.nav_${item.key}`)}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>
          <main className="col-lg-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
