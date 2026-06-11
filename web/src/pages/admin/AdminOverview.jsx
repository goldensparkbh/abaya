import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useT } from '../../i18n/I18nContext.jsx';
import { getAdminOverview } from '../../services/admin.js';
import { seedDefaultSettings } from '../../services/settings.js';

export default function AdminOverview() {
  const t = useT();
  const [data, setData] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    getAdminOverview().then(setData);
  }, []);

  async function onSeed() {
    setSeeding(true);
    try {
      await seedDefaultSettings();
      const next = await getAdminOverview();
      setData(next);
    } finally {
      setSeeding(false);
    }
  }

  if (!data) return <p className="text-muted">{t('common.loading')}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h1 className="cart-page-title mb-0">{t('admin.overview_title')}</h1>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onSeed} disabled={seeding}>
          {seeding ? t('common.loading') : t('admin.seed_defaults')}
        </button>
      </div>

      <div className="row mb-4">
        {[
          { label: t('admin.stat_shops'), value: `${data.activeShops}/${data.shopCount}` },
          { label: t('admin.stat_products'), value: data.productCount },
          { label: t('admin.stat_orders'), value: data.orderCount },
          { label: t('admin.stat_custom'), value: data.customDesignCount },
          { label: t('admin.stat_revenue'), value: `${data.revenue.toFixed(2)} BHD` },
        ].map((s) => (
          <div key={s.label} className="col-md-4 col-xl mb-3">
            <div className="panel-card text-center">
              <p className="h4 font-weight-bold mb-1">{s.value}</p>
              <p className="small text-muted mb-0">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="h6 font-weight-bold text-uppercase text-muted mb-3">{t('admin.recent_orders')}</h2>
      {data.recentOrders.map((o) => (
        <div key={o.id} className="panel-card mb-2 d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <p className="font-weight-bold mb-0 small">
              {o.type === 'custom_design' ? t('orders.custom_design') : t('orders.shop_order')} — {o.customerName}
            </p>
            <p className="small text-muted mb-0">{o.total} {o.currency || 'BHD'}</p>
          </div>
          <StatusBadge status={o.status} />
        </div>
      ))}

      <div className="mt-4 d-flex flex-wrap" style={{ gap: '0.5rem' }}>
        <Link to="/admin/shops" className="btn btn-sm btn-brand">{t('admin.nav_shops')}</Link>
        <Link to="/admin/payment-gateway" className="btn btn-sm btn-outline-secondary">{t('admin.nav_payment_gateway')}</Link>
      </div>
    </div>
  );
}
