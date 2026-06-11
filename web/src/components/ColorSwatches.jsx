import React from 'react';
import { isLightColor, resolveColorHex } from '../utils/colorMap.js';

export default function ColorSwatches({
  colors = [],
  lookup,
  value,
  onChange,
  size = 'md',
  readOnly = false,
  className = '',
  'aria-label': ariaLabel,
}) {
  if (!colors.length) return null;

  const sizeClass = size === 'sm' ? 'color-swatch--sm' : '';

  return (
    <div
      className={`color-swatches${readOnly ? ' color-swatches--readonly' : ''} ${className}`.trim()}
      role={readOnly ? 'list' : 'radiogroup'}
      aria-label={ariaLabel}
    >
      {colors.map((name) => {
        const hex = resolveColorHex(name, lookup);
        const active = value === name;
        const light = isLightColor(hex);

        if (readOnly || !onChange) {
          return (
            <span
              key={name}
              role="listitem"
              className={`color-swatch color-swatch--readonly ${sizeClass}${light ? ' color-swatch--light' : ''}`}
              style={{ background: hex }}
              title={name}
              aria-label={name}
            />
          );
        }

        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={name}
            title={name}
            className={`color-swatch ${sizeClass}${active ? ' color-swatch--active' : ''}${light ? ' color-swatch--light' : ''}`}
            style={{ background: hex }}
            onClick={() => onChange(name)}
          />
        );
      })}
    </div>
  );
}
