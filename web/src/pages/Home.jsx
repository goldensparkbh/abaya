import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ColorSwatches from '../components/ColorSwatches.jsx';
import ConfigBanner from '../components/ConfigBanner.jsx';
import ShopBrand from '../components/ShopBrand.jsx';
import usePlatformColors from '../hooks/usePlatformColors.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';
import { attachShopLogos, listProducts, listShops, shopsById } from '../services/catalog.js';
import { db } from '../firebase.js';

export default function Home() {
  const t = useT();
  const { profile } = useAuth();
  const role = profile?.role || 'customer';
  const isShop = role === 'shop' || role === 'business';
  const [featured, setFeatured] = useState([]);
  const { lookup } = usePlatformColors();

  useEffect(() => {
    if (!db) return;
    (async () => {
      const [shops, products] = await Promise.all([listShops(), listProducts({ limit: 4 })]);
      setFeatured(attachShopLogos(products, shopsById(shops)));
    })();
  }, []);

  const customerCta = (
    <>
      <Link to="/shop" className="btn btn-hero-primary">
        {t('hero.cta_shop')}
      </Link>
      <Link to="/custom-design" className="btn btn-hero-outline">
        {t('hero.cta_custom')}
      </Link>
    </>
  );

  const shopCta = (
    <>
      <Link to="/shop/dashboard" className="btn btn-hero-primary">
        {t('hero.cta_dashboard')}
      </Link>
      <Link to="/shop/products" className="btn btn-hero-outline">
        {t('hero.cta_manage_products')}
      </Link>
    </>
  );

  return (
    <>
      <ConfigBanner />
      <section className="site-hero">
        <div className="site-hero__inner container">
          <p className="site-hero__eyebrow">{t('hero.eyebrow')}</p>
          <h1 className="site-hero__title">{t('hero.title')}</h1>
          <p className="site-hero__lead">{t('hero.lead')}</p>
          <div className="site-hero__actions">{isShop ? shopCta : customerCta}</div>
        </div>
      </section>

      {featured.length ? (
        <section className="catalog-section">
          <div className="container">
            <header className="section-header text-center mb-4">
              <p className="section-header__eyebrow">{t('home.featured_eyebrow')}</p>
              <h2 className="section-header__title">{t('home.featured_title')}</h2>
            </header>
            <div className="row">
              {featured.map((p) => (
                <div key={p.id} className="col-sm-6 col-lg-3 mb-4">
                  <Link to={`/products/${p.id}`} className="product-card d-block h-100 text-decoration-none">
                    <div className="product-card__media">
                      <img src={p.images?.[0] || '/img/placeholder-product.svg'} alt={p.name} />
                      {p.shopLogo ? <img src={p.shopLogo} alt="" className="product-card__brand-logo" /> : null}
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
            <Link to="/shop" className="home-ad-banner" aria-label={t('home.ad_banner_alt')}>
              <img src="/img/home-ad-banner.png" alt="" />
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
