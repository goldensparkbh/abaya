import React from 'react';
import { useT } from '../i18n/I18nContext.jsx';

export const SIZE_FIELDS = [
  { key: 'shoulder' },
  { key: 'bust' },
  { key: 'waist' },
  { key: 'hip' },
  { key: 'length' },
  { key: 'sleeve' },
  { key: 'armhole' },
  { key: 'neck' },
];

const HOTSPOTS = [
  { n: 1, key: 'shoulder', x: 100, y: 60 },
  { n: 2, key: 'bust', x: 100, y: 105 },
  { n: 3, key: 'waist', x: 100, y: 145 },
  { n: 4, key: 'hip', x: 100, y: 185 },
  { n: 5, key: 'length', x: 100, y: 330 },
  { n: 6, key: 'sleeve', x: 38, y: 145 },
  { n: 7, key: 'armhole', x: 60, y: 80 },
  { n: 8, key: 'neck', x: 100, y: 28 },
];

function Hotspot({ n, x, y, active }) {
  return (
    <g>
      <circle cx={x} cy={y} r="11" className={`size-hotspot ${active ? 'is-active' : ''}`} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {n}
      </text>
    </g>
  );
}

export default function SizeGuide({ value = {}, onChange, focus, setFocus, readOnly = false }) {
  const t = useT();

  function update(key, v) {
    if (readOnly) return;
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="size-guide">
      <div className="size-guide__figure">
        <svg viewBox="0 0 200 380" role="img" aria-label={t('post.section_measurements')}>
          <defs>
            <linearGradient id="abayaFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34504f" />
              <stop offset="100%" stopColor="#243838" />
            </linearGradient>
          </defs>
          <path d="M88 24 Q100 14 112 24 L112 36 Q100 30 88 36 Z" fill="url(#abayaFill)" />
          <path
            d="M40 70 Q70 50 100 50 Q130 50 160 70 L172 145 Q165 150 158 145 L150 95 L150 360 Q125 372 100 372 Q75 372 50 360 L50 95 L42 145 Q35 150 28 145 Z"
            fill="url(#abayaFill)"
            stroke="#1c2c2c"
            strokeWidth="1"
          />
          <line x1="100" y1="55" x2="100" y2="370" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M60 200 Q100 210 140 200" stroke="rgba(255,255,255,0.1)" fill="none" />

          {HOTSPOTS.map((h) => (
            <Hotspot key={h.n} n={h.n} x={h.x} y={h.y} active={focus === h.key} />
          ))}
        </svg>
      </div>
      <div className="size-guide__inputs">
        {SIZE_FIELDS.map((f) => {
          const num = HOTSPOTS.find((h) => h.key === f.key)?.n;
          return (
            <div
              key={f.key}
              className={`size-input ${focus === f.key ? 'is-focused' : ''}`}
              onMouseEnter={() => setFocus?.(f.key)}
              onFocus={() => setFocus?.(f.key)}
              onMouseLeave={() => setFocus?.(null)}
              onBlur={() => setFocus?.(null)}
            >
              <label className="size-input__label" htmlFor={`size-${f.key}`}>
                <span className="size-input__num">{num}</span>
                {t(`size_guide.${f.key}`)}
              </label>
              <div className="size-input__field">
                <input
                  id={`size-${f.key}`}
                  type="number"
                  min={0}
                  step="0.5"
                  inputMode="decimal"
                  className="form-control form-control-sm"
                  value={value[f.key] ?? ''}
                  onChange={(e) => update(f.key, e.target.value)}
                  readOnly={readOnly}
                  placeholder={t('common.cm')}
                />
                <span className="size-input__unit">{t('common.cm')}</span>
              </div>
              <p className="size-input__hint">{t(`size_guide.${f.key}_hint`)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
