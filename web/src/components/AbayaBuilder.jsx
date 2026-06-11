import React, { Suspense, lazy, useState } from 'react';
import { useT } from '../i18n/I18nContext.jsx';
import AbayaPreview from './AbayaPreview.jsx';
import CinematicVideoModal from './CinematicVideoModal.jsx';
import {
  COLOR_OPTIONS,
  FABRIC_OPTIONS,
  SIZE_KEYS,
  SIZE_RANGES,
  defaultSizes,
  hexForColor,
} from './abayaModel.js';

const Abaya3DScene = lazy(() => import('./Abaya3DScene.jsx'));

const TABS = [
  { id: 'color', icon: 'fa-palette', key: 'builder.tabs_color' },
  { id: 'fabric', icon: 'fa-th', key: 'builder.tabs_fabric' },
  { id: 'sizes', icon: 'fa-ruler-vertical', key: 'builder.tabs_sizes' },
  { id: 'details', icon: 'fa-pencil-alt', key: 'builder.tabs_details' },
];

function ColorTab({ t, color, setColor, customHex, setCustomHex }) {
  return (
    <div>
      <p className="small text-muted mb-3">{t('builder.color_lead')}</p>
      <div className="swatch-grid">
        {COLOR_OPTIONS.map((c) => {
          const isSelected = color === c.key;
          const background = c.key === 'Custom' ? customHex || c.hex : c.hex;
          return (
            <button
              key={c.key}
              type="button"
              className={`swatch swatch--color ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setColor(c.key)}
              aria-pressed={isSelected}
              aria-label={t(`color.${c.key}`)}
            >
              <span className="swatch__circle" style={{ background }}>
                {c.key === 'Custom' ? <i className="fas fa-eye-dropper" aria-hidden="true" /> : null}
              </span>
              <span className="swatch__label">{t(`color.${c.key}`)}</span>
            </button>
          );
        })}
      </div>
      {color === 'Custom' ? (
        <label className="custom-color mt-3">
          <span>{t('builder.pick_color')}</span>
          <input type="color" value={customHex || '#7a5a8a'} onChange={(e) => setCustomHex(e.target.value)} />
          <code>{(customHex || '#7a5a8a').toUpperCase()}</code>
        </label>
      ) : null}
    </div>
  );
}

function FabricTab({ t, fabric, setFabric, fabricOther, setFabricOther, previewColor }) {
  return (
    <div>
      <p className="small text-muted mb-3">{t('builder.fabric_lead')}</p>
      <div className="swatch-grid">
        {FABRIC_OPTIONS.map((f) => {
          const isSelected = fabric === f;
          return (
            <button
              key={f}
              type="button"
              className={`swatch swatch--fabric ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setFabric(f)}
              aria-pressed={isSelected}
              aria-label={t(`fabric.${f}`)}
            >
              <span className="swatch__circle swatch__circle--fabric" style={{ background: previewColor }}>
                <FabricSwatchOverlay fabric={f} />
              </span>
              <span className="swatch__label">{t(`fabric.${f}`)}</span>
            </button>
          );
        })}
      </div>
      {fabric === 'Other' ? (
        <input
          className="form-control mt-3"
          placeholder={t('post.field_fabric_other_ph')}
          value={fabricOther}
          onChange={(e) => setFabricOther(e.target.value)}
        />
      ) : null}
    </div>
  );
}

function FabricSwatchOverlay({ fabric }) {
  if (fabric === 'Other') {
    return (
      <span className="fabric-swatch-other">
        <i className="fas fa-ellipsis-h" />
      </span>
    );
  }
  return (
    <svg viewBox="0 0 60 60" className="fabric-swatch-svg" aria-hidden="true">
      <defs>
        <pattern id={`sw-${fabric}`} patternUnits="userSpaceOnUse" width={fabric === 'Linen' ? 6 : fabric === 'Chiffon' ? 10 : 4} height={fabric === 'Linen' ? 6 : fabric === 'Chiffon' ? 10 : 4}>
          {fabric === 'Crepe' ? <circle cx="1" cy="1" r="0.5" fill="rgba(0,0,0,0.32)" /> : null}
          {fabric === 'Chiffon' ? <path d="M0 0 L10 10 M-2 8 L8 -2" stroke="rgba(255,255,255,0.32)" strokeWidth="0.6" /> : null}
          {fabric === 'Nida' ? <rect width="4" height="4" fill="rgba(0,0,0,0.08)" /> : null}
          {fabric === 'Linen' ? (
            <>
              <path d="M0 3 L6 3" stroke="rgba(0,0,0,0.28)" strokeWidth="0.6" />
              <path d="M3 0 L3 6" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
            </>
          ) : null}
          {fabric === 'Cotton' ? (
            <>
              <circle cx="1" cy="1" r="0.55" fill="rgba(255,255,255,0.3)" />
              <circle cx="3" cy="3" r="0.45" fill="rgba(0,0,0,0.2)" />
            </>
          ) : null}
        </pattern>
        <linearGradient id={`sw-silk-${fabric}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" fill={fabric === 'Silk' ? `url(#sw-silk-${fabric})` : `url(#sw-${fabric})`} />
    </svg>
  );
}

function SizesTab({ t, sizes, setSizes }) {
  function setOne(key, val) {
    setSizes({ ...sizes, [key]: Number(val) });
  }
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="small text-muted mb-0">{t('builder.sizes_lead')}</p>
        <button
          type="button"
          className="btn btn-link btn-sm px-0"
          onClick={() => setSizes(defaultSizes())}
        >
          {t('builder.reset_sizes')}
        </button>
      </div>
      <div className="size-sliders">
        {SIZE_KEYS.map((k) => {
          const r = SIZE_RANGES[k];
          const v = Number(sizes[k] ?? r.default);
          return (
            <div className="size-slider" key={k}>
              <div className="size-slider__head">
                <label htmlFor={`s-${k}`} className="size-slider__label">
                  {t(`size_guide.${k}`)}
                </label>
                <span className="size-slider__value">{t('builder.range_label', { value: v })}</span>
              </div>
              <input
                id={`s-${k}`}
                type="range"
                min={r.min}
                max={r.max}
                step={r.step}
                value={v}
                onChange={(e) => setOne(k, e.target.value)}
                className="size-slider__input"
              />
              <p className="size-slider__hint">{t(`size_guide.${k}_hint`)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailsTab({ t, title, setTitle, description, setDescription, quantity, setQuantity, budgetMin, setBudgetMin, budgetMax, setBudgetMax }) {
  return (
    <div>
      <p className="small text-muted mb-3">{t('builder.details_lead')}</p>
      <div className="form-group">
        <label className="size-input__label" htmlFor="r-title">
          {t('post.field_title')}
        </label>
        <input id="r-title" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('post.field_title_ph')} />
      </div>
      <div className="form-group">
        <label className="size-input__label" htmlFor="r-desc">
          {t('post.field_desc')}
        </label>
        <textarea
          id="r-desc"
          className="form-control"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('post.field_desc_ph')}
        />
      </div>
      <div className="row">
        <div className="col-4 form-group">
          <label className="size-input__label" htmlFor="r-qty">
            {t('post.field_qty')}
          </label>
          <input id="r-qty" type="number" min={1} max={50} className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="col-4 form-group">
          <label className="size-input__label" htmlFor="r-bmin">
            {t('post.field_budget_min')}
          </label>
          <input id="r-bmin" type="number" min={0} className="form-control" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder={t('common.bhd')} />
        </div>
        <div className="col-4 form-group">
          <label className="size-input__label" htmlFor="r-bmax">
            {t('post.field_budget_max')}
          </label>
          <input id="r-bmax" type="number" min={0} className="form-control" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder={t('common.bhd')} />
        </div>
      </div>
    </div>
  );
}

export default function AbayaBuilder({
  color,
  setColor,
  customHex,
  setCustomHex,
  fabric,
  setFabric,
  fabricOther,
  setFabricOther,
  sizes,
  setSizes,
  title,
  setTitle,
  description,
  setDescription,
  quantity,
  setQuantity,
  budgetMin,
  setBudgetMin,
  budgetMax,
  setBudgetMax,
}) {
  const t = useT();
  const [tab, setTab] = useState('color');
  const [autoRotate, setAutoRotate] = useState(false);
  const [wind, setWind] = useState(true);
  const [showMannequin, setShowMannequin] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);

  const colorHexResolved = color === 'Custom' ? customHex : hexForColor(color);

  return (
    <div className="abaya-builder">
      <aside className="abaya-builder__preview">
        <div className="abaya-builder__preview-inner">
          <Suspense
            fallback={
              <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AbayaPreview color={color} colorHex={colorHexResolved} fabric={fabric} sizes={sizes} />
              </div>
            }
          >
            <Abaya3DScene
              color={color}
              colorHex={colorHexResolved}
              fabric={fabric}
              sizes={sizes}
              autoRotate={autoRotate}
              wind={wind}
              showMannequin={showMannequin}
              height={480}
            />
          </Suspense>
          <div className="abaya-builder__preview-bar">
            <button
              type="button"
              className={`btn-pill ${autoRotate ? 'is-on' : ''}`}
              onClick={() => setAutoRotate((v) => !v)}
              title={t('builder.auto_rotate')}
            >
              <i className="fas fa-sync-alt mr-2" aria-hidden="true" />
              {t('builder.auto_rotate')}
            </button>
            <button
              type="button"
              className={`btn-pill ${wind ? 'is-on' : ''}`}
              onClick={() => setWind((v) => !v)}
              title={t('builder.wind')}
            >
              <i className="fas fa-wind mr-2" aria-hidden="true" />
              {t('builder.wind')}
            </button>
            <button
              type="button"
              className={`btn-pill ${showMannequin ? 'is-on' : ''}`}
              onClick={() => setShowMannequin((v) => !v)}
              title={t('builder.mannequin')}
            >
              <i className="fas fa-female mr-2" aria-hidden="true" />
              {t('builder.mannequin')}
            </button>
            <button type="button" className="btn-pill btn-pill--accent" onClick={() => setVideoOpen(true)}>
              <i className="fas fa-film mr-2" aria-hidden="true" />
              {t('builder.cinematic_cta')}
            </button>
          </div>
          <p className="small text-muted text-center mt-2 mb-0">{t('builder.preview_caption')}</p>
        </div>
      </aside>

      <CinematicVideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        payload={{
          color,
          colorHex: colorHexResolved,
          fabric: fabric === 'Other' ? fabricOther || 'Other' : fabric,
          sizes,
          description,
          title,
        }}
      />

      <section className="abaya-builder__controls">
        <nav className="builder-tabs" role="tablist">
          {TABS.map((tabDef) => (
            <button
              key={tabDef.id}
              type="button"
              role="tab"
              aria-selected={tab === tabDef.id}
              className={`builder-tab ${tab === tabDef.id ? 'is-active' : ''}`}
              onClick={() => setTab(tabDef.id)}
            >
              <i className={`fas ${tabDef.icon}`} aria-hidden="true" />
              <span>{t(tabDef.key)}</span>
            </button>
          ))}
        </nav>

        <div className="builder-panel">
          {tab === 'color' && (
            <ColorTab t={t} color={color} setColor={setColor} customHex={customHex} setCustomHex={setCustomHex} />
          )}
          {tab === 'fabric' && (
            <FabricTab
              t={t}
              fabric={fabric}
              setFabric={setFabric}
              fabricOther={fabricOther}
              setFabricOther={setFabricOther}
              previewColor={color === 'Custom' ? customHex || '#7a5a8a' : (COLOR_OPTIONS.find((c) => c.key === color) || COLOR_OPTIONS[0]).hex}
            />
          )}
          {tab === 'sizes' && <SizesTab t={t} sizes={sizes} setSizes={setSizes} />}
          {tab === 'details' && (
            <DetailsTab
              t={t}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              quantity={quantity}
              setQuantity={setQuantity}
              budgetMin={budgetMin}
              setBudgetMin={setBudgetMin}
              budgetMax={budgetMax}
              setBudgetMax={setBudgetMax}
            />
          )}
        </div>
      </section>
    </div>
  );
}
