import React from 'react';
import { Link } from 'react-router-dom';
import ColorSwatches from '../components/ColorSwatches.jsx';
import { useCart } from '../context/CartContext.jsx';
import usePlatformColors from '../hooks/usePlatformColors.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function Cart() {
  const t = useT();
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { lookup } = usePlatformColors();

  if (!items.length) {
    return (
      <div className="container content-page">
        <div className="empty-state">
          <h2 className="h4 mb-3">{t('cart.empty_title')}</h2>
          <p className="text-muted mb-4">{t('cart.empty_body')}</p>
          <Link to="/shop" className="btn btn-brand">{t('cart.browse')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <h1 className="cart-page-title mb-4">{t('cart.title')}</h1>
      <div className="row">
        <div className="col-lg-8">
          {items.map((item) => (
            <div key={item.key} className="panel-card mb-3 d-flex flex-wrap align-items-center">
              <img
                src={item.image || '/img/placeholder-product.svg'}
                alt=""
                style={{ width: 80, height: 96, objectFit: 'cover', borderRadius: 8 }}
                className="mr-3 mb-2"
              />
              <div className="flex-grow-1 mb-2">
                <h3 className="h6 font-weight-bold mb-1">{item.name}</h3>
                <p className="small text-muted mb-0">{item.shopName}</p>
                {item.size ? <p className="small mb-0">{t('product.size')}: {item.size}</p> : null}
                {item.color ? (
                  <div className="d-flex align-items-center small mb-0" style={{ gap: '0.4rem' }}>
                    <span>{t('product.color')}:</span>
                    <ColorSwatches colors={[item.color]} lookup={lookup} size="sm" readOnly />
                  </div>
                ) : null}
              </div>
              <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: 70 }}
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.key, Number(e.target.value))}
                />
                <span className="font-weight-bold" style={{ minWidth: 80 }}>
                  {(item.price * item.quantity).toFixed(2)} BHD
                </span>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.key)}>
                  {t('cart.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="panel-card">
            <h3 className="h6 font-weight-bold mb-3">{t('cart.summary')}</h3>
            <div className="d-flex justify-content-between mb-2">
              <span>{t('cart.subtotal')}</span>
              <span className="font-weight-bold">{subtotal.toFixed(2)} BHD</span>
            </div>
            <Link to="/checkout" className="btn btn-brand btn-block mt-3">
              {t('cart.checkout')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
