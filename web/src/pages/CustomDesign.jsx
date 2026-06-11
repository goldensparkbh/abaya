import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import MeasurementGuide from '../components/MeasurementGuide.jsx';
import PaymentForm from '../components/PaymentForm.jsx';
import { MEASUREMENT_KEYS, MEASUREMENT_LABELS, MEASUREMENT_RANGES, defaultMeasurements } from '../data/measurements.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n, useT } from '../i18n/I18nContext.jsx';
import { createCustomDesignOrder, updateOrderPayment } from '../services/orders.js';
import { processPayment } from '../services/payment.js';
import { queueOrderNotifications } from '../services/notifications.js';
import { getPlatformSettings, listAbayaModels, listColors, listMaterials } from '../services/settings.js';
import { db } from '../firebase.js';

export default function CustomDesign() {
  const t = useT();
  const { lang } = useI18n();
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [measurements, setMeasurements] = useState(defaultMeasurements());
  const [modelId, setModelId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [colorId, setColorId] = useState('');
  const [notes, setNotes] = useState('');
  const [models, setModels] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!db) return;
    Promise.all([listAbayaModels(true), listMaterials(true), listColors(true), getPlatformSettings()]).then(([md, m, c, p]) => {
      setModels(md);
      setMaterials(m);
      setColors(c);
      setPlatform(p);
      if (md.length) setModelId(md[0].id);
      if (m.length) setMaterialId(m[0].id);
      if (c.length) setColorId(c[0].id);
    });
  }, []);

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container content-page">
        <div className="empty-state">
          <h2 className="h4 mb-3">{t('custom.sign_in_title')}</h2>
          <button type="button" className="btn btn-brand" onClick={() => nav('/login')}>
            {t('login.submit')}
          </button>
        </div>
      </div>
    );
  }

  const labels = MEASUREMENT_LABELS[lang] || MEASUREMENT_LABELS.en;
  const model = models.find((m) => m.id === modelId);
  const material = materials.find((m) => m.id === materialId);
  const color = colors.find((c) => c.id === colorId);
  const baseFee = platform?.customDesignFee ?? 25;
  const materialExtra = material?.priceModifier || 0;
  const total = baseFee + materialExtra;
  const currency = platform?.currency || 'BHD';

  async function onPay(card) {
    setErr('');
    if (!model || !material || !color) {
      setErr(t('custom.err_selection'));
      return;
    }
    setBusy(true);
    try {
      const orderId = await createCustomDesignOrder({
        customer: {
          id: user.uid,
          name: profile?.displayName || user.displayName || user.email,
          email: user.email,
          mobile: profile?.mobile || '',
        },
        measurements,
        model: { id: model.id, name: model.name, imageUrl: model.imageUrl },
        material: { id: material.id, name: material.name },
        color: { id: color.id, name: color.name, hex: color.hex },
        notes,
        totals: { subtotal: total, shipping: 0, total },
        currency,
      });

      const payment = await processPayment({
        orderId,
        amount: total,
        currency,
        customer: {
          name: profile?.displayName || user.email,
          email: user.email,
          mobile: profile?.mobile,
        },
        card,
        description: `Custom design ${orderId}`,
      });

      await updateOrderPayment(orderId, payment);
      await queueOrderNotifications({
        order: {
          id: orderId,
          customerName: profile?.displayName || user.email,
          customerEmail: user.email,
          customerMobile: profile?.mobile,
          total,
          currency,
        },
        type: 'custom_design',
      });

      nav(`/custom-design/confirmation/${orderId}`);
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <header className="section-header mb-4">
        <p className="section-header__eyebrow">{t('custom.eyebrow')}</p>
        <h1 className="section-header__title">{t('custom.title')}</h1>
        <p className="section-header__subtitle">{t('custom.lead')}</p>
      </header>

      <div className="custom-design-steps mb-4 d-flex flex-wrap" style={{ gap: '0.5rem' }}>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            className={`btn btn-sm ${step === n ? 'btn-brand' : 'btn-outline-secondary'}`}
            onClick={() => setStep(n)}
          >
            {t(`custom.step${n}`)}
          </button>
        ))}
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}

      {step === 1 ? (
        <div className="row">
          <div className="col-lg-5 mb-4">
            <MeasurementGuide imageUrl={platform?.measurementGuideUrl} />
          </div>
          <div className="col-lg-7">
            <div className="panel-card">
              <h3 className="h6 font-weight-bold mb-3">{t('custom.measurements_title')}</h3>
              <div className="row">
                {MEASUREMENT_KEYS.map((key) => (
                  <div key={key} className="form-group col-md-6">
                    <label>{labels[key]} ({t('common.cm')})</label>
                    <input
                      type="number"
                      className="form-control"
                      min={MEASUREMENT_RANGES[key].min}
                      max={MEASUREMENT_RANGES[key].max}
                      step={MEASUREMENT_RANGES[key].step}
                      value={measurements[key]}
                      onChange={(e) => setMeasurements({ ...measurements, [key]: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-brand" onClick={() => setStep(2)}>
                {t('custom.continue')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="row">
          <div className="col-lg-7 mb-4">
            <div className="panel-card">
              <h3 className="h6 font-weight-bold mb-3">{t('custom.models_title')}</h3>
              {models.length ? (
                <div className="row mb-4">
                  {models.map((m) => (
                    <div key={m.id} className="col-sm-6 col-md-4 mb-3">
                      <label className={`abaya-model-option ${modelId === m.id ? 'abaya-model-option--active' : ''}`}>
                        <input type="radio" name="abayaModel" checked={modelId === m.id} onChange={() => setModelId(m.id)} />
                        <img src={m.imageUrl || '/img/placeholder-product.svg'} alt={m.name} className="abaya-model-option__img" />
                        <span className="abaya-model-option__name">{lang === 'ar' && m.nameAr ? m.nameAr : m.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="small text-muted mb-4">{t('custom.no_models')}</p>
              )}

              <h3 className="h6 font-weight-bold mb-3">{t('custom.materials_title')}</h3>
              <div className="row mb-4">
                {materials.map((m) => (
                  <div key={m.id} className="col-md-6 mb-2">
                    <label className={`material-option ${materialId === m.id ? 'material-option--active' : ''}`}>
                      <input type="radio" name="material" checked={materialId === m.id} onChange={() => setMaterialId(m.id)} />
                      <span className="font-weight-bold">{lang === 'ar' && m.nameAr ? m.nameAr : m.name}</span>
                      {m.priceModifier ? <span className="small text-muted d-block">+{m.priceModifier} {currency}</span> : null}
                    </label>
                  </div>
                ))}
              </div>

              <h3 className="h6 font-weight-bold mb-3">{t('custom.colors_title')}</h3>
              <div className="d-flex flex-wrap mb-4" style={{ gap: '0.75rem' }}>
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`color-swatch ${colorId === c.id ? 'color-swatch--active' : ''}`}
                    style={{ background: c.hex }}
                    title={lang === 'ar' && c.nameAr ? c.nameAr : c.name}
                    onClick={() => setColorId(c.id)}
                  />
                ))}
              </div>

              <div className="form-group">
                <label>{t('custom.notes')} {t('common.optional')}</label>
                <textarea className="form-control" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('custom.notes_ph')} />
              </div>

              <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>{t('common.back')}</button>
                <button type="button" className="btn btn-brand" onClick={() => setStep(3)}>{t('custom.continue')}</button>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="panel-card">
              <h3 className="h6 font-weight-bold mb-3">{t('custom.summary')}</h3>
              <p className="small mb-1">{t('custom.base_fee')}: {baseFee} {currency}</p>
              {materialExtra ? <p className="small mb-1">{t('custom.material_fee')}: +{materialExtra} {currency}</p> : null}
              <p className="font-weight-bold h5 mt-3">{total} {currency}</p>
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="panel-card">
              <h3 className="h6 font-weight-bold mb-3">{t('custom.review_title')}</h3>
              <p className="small text-muted mb-3">{t('custom.review_body')}</p>
              {model?.imageUrl ? (
                <img src={model.imageUrl} alt={model.name} className="abaya-model-option__img mb-3" style={{ maxWidth: 120 }} />
              ) : null}
              <p className="small mb-1"><strong>{t('custom.models_title')}:</strong> {model?.name}</p>
              <p className="small mb-1"><strong>{t('custom.materials_title')}:</strong> {material?.name}</p>
              <p className="small mb-1"><strong>{t('custom.colors_title')}:</strong> {color?.name}</p>
              {notes ? <p className="small mb-1"><strong>{t('custom.notes')}:</strong> {notes}</p> : null}
              <p className="font-weight-bold mt-3">{t('checkout.total')}: {total} {currency}</p>
              <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setStep(2)}>{t('common.back')}</button>
            </div>
          </div>
          <div className="col-lg-6">
            <PaymentForm onSubmit={onPay} busy={busy} amount={total.toFixed(2)} currency={currency} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
