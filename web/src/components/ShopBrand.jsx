import React from 'react';

export default function ShopBrand({ name, logo, size = 'sm', className = '' }) {
  const isMd = size === 'md';

  return (
    <span className={`shop-brand shop-brand--${size} ${className}`.trim()}>
      {logo ? (
        <img src={logo} alt="" className="shop-brand__logo" />
      ) : (
        <span className="shop-brand__fallback" aria-hidden="true">
          {(name || '?').charAt(0).toUpperCase()}
        </span>
      )}
      {name ? <span className={`shop-brand__name${isMd ? ' font-weight-bold' : ''}`}>{name}</span> : null}
    </span>
  );
}
