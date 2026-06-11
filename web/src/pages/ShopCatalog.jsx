import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ColorSwatches from '../components/ColorSwatches.jsx';
import ConfigBanner from '../components/ConfigBanner.jsx';
import ShopBrand from '../components/ShopBrand.jsx';
import usePlatformColors from '../hooks/usePlatformColors.js';
import { attachShopLogos, listProducts, listShops, shopsById } from '../services/catalog.js';
import { db } from '../firebase.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function ShopCatalog() {
  const t = useT();
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterShop, setFilterShop] = useState('');
  const [loading, setLoading] = useState(true);
  const { lookup } = usePlatformColors();

  useEffect(() => {
    if (!db) return;
    (async () => {
      setLoading(true);
      try {
        const [s, p] = await Promise.all([listShops(), listProducts()]);
        setShops(s);
        setProducts(attachShopLogos(p, shopsById(s)));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filterShop ? products.filter((p) => p.shopId === filterShop) : products;

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <header className="section-header mb-4">
        <p className="section-header__eyebrow">{t('shop.eyebrow')}</p>
        <h1 className="section-header__title">{t('shop.title')}</h1>
        <p className="section-header__subtitle">{t('shop.lead')}</p>
      </header>

      <div className="row mb-4">
        {shops.map((shop) => (
          <div key={shop.id} className="col-md-4 col-lg-3 mb-3">
            <button
              type="button"
              className={`shop-folder panel-card w-100 text-left${filterShop === shop.id ? ' shop-folder--active' : ''}`}
              onClick={() => setFilterShop(filterShop === shop.id ? '' : shop.id)}
            >
              <ShopBrand name={shop.shopName} logo={shop.logo} size="md" className="mb-2" />
              <p className="small text-muted mb-0">{shop.description || t('shop.default_desc')}</p>
            </button>
          </div>
        ))}
      </div>

      {loading ? <p className="text-muted">{t('common.loading')}</p> : null}
      {!loading && !filtered.length ? (
        <div className="empty-state">
          <p className="text-muted">{t('shop.no_products')}</p>
        </div>
      ) : null}

      <div className="row">
        {filtered.map((p) => (
          <div key={p.id} className="col-sm-6 col-lg-4 col-xl-3 mb-4">
            <Link to={`/products/${p.id}`} className="product-card d-block h-100 text-decoration-none">
              <div className="product-card__media">
                <img src={p.images?.[0] || '/img/placeholder-product.svg'} alt={p.name} />
                {p.shopLogo ? (
                  <img src={p.shopLogo} alt="" className="product-card__brand-logo" />
                ) : null}
              </div>
              <div className="card-body">
                <ShopBrand name={p.shopName} logo={p.shopLogo} size="sm" className="mb-2" />
                <h3 className="h6 font-weight-bold mb-2" style={{ color: 'var(--color-text)' }}>{p.name}</h3>
                {p.colors?.length ? (
                  <ColorSwatches
                    colors={p.colors}
                    lookup={lookup}
                    size="sm"
                    readOnly
                    className="mb-2"
                  />
                ) : null}
                <p className="font-weight-bold mb-0" style={{ color: 'var(--color-primary)' }}>
                  {p.price} {p.currency || 'BHD'}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
