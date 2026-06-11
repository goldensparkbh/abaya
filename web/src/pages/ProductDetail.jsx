import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ColorSwatches from '../components/ColorSwatches.jsx';
import ConfigBanner from '../components/ConfigBanner.jsx';
import ShopBrand from '../components/ShopBrand.jsx';
import { useCart } from '../context/CartContext.jsx';
import usePlatformColors from '../hooks/usePlatformColors.js';
import { getProduct, getShop } from '../services/catalog.js';
import { db } from '../firebase.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const t = useT();
  const { addItem } = useCart();
  const { lookup } = usePlatformColors();
  const [product, setProduct] = useState(null);
  const [shopLogo, setShopLogo] = useState(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!db || !id) return;
    getProduct(id).then(async (p) => {
      setProduct(p);
      if (p) {
        setSize(p.sizes?.[0] || 'Free size');
        setColor(p.colors?.[0] || '');
        const shop = await getShop(p.shopId);
        setShopLogo(shop?.logo || null);
      }
    });
  }, [id]);

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container content-page">
        <p className="text-muted">{t('common.loading')}</p>
      </div>
    );
  }

  function onAdd() {
    addItem(product, { size, color, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <nav className="mb-3 small">
        <Link to="/shop">{t('nav.shop')}</Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="product-card__media product-card__media--detail" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={product.images?.[0] || '/img/placeholder-product.svg'}
              alt={product.name}
              style={{ width: '100%', height: 'auto', maxHeight: 520, objectFit: 'cover' }}
            />
            {shopLogo ? <img src={shopLogo} alt="" className="product-card__brand-logo" /> : null}
          </div>
        </div>
        <div className="col-lg-6">
          <ShopBrand name={product.shopName} logo={shopLogo} size="md" className="mb-3" />
          <h1 className="h3 font-weight-bold mb-3">{product.name}</h1>
          <p className="h4 font-weight-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            {product.price} {product.currency || 'BHD'}
          </p>
          <p className="text-muted mb-4">{product.description}</p>

          {product.sizes?.length > 1 ? (
            <div className="form-group">
              <label>{t('product.size')}</label>
              <select className="form-control" value={size} onChange={(e) => setSize(e.target.value)}>
                {product.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ) : null}

          {product.colors?.length ? (
            <div className="form-group">
              <label className="d-block mb-2">{t('product.color')}</label>
              <ColorSwatches
                colors={product.colors}
                lookup={lookup}
                value={color}
                onChange={setColor}
                aria-label={t('product.color')}
              />
            </div>
          ) : null}

          <div className="form-group">
            <label>{t('product.quantity')}</label>
            <input
              type="number"
              className="form-control"
              min={1}
              max={product.stock || 99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="d-flex flex-wrap" style={{ gap: '0.75rem' }}>
            <button type="button" className="btn btn-brand px-4" onClick={onAdd}>
              {added ? t('product.added') : t('product.add_to_cart')}
            </button>
            <Link to="/cart" className="btn btn-outline-secondary px-4">
              {t('nav.cart')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
