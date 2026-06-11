import React, { useState } from 'react';
import { formatCardNumber } from '../services/payment.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function PaymentForm({ onSubmit, busy, amount, currency }) {
  const t = useT();
  const [cardholder, setCardholder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ cardholder, number, expiry, cvc });
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form panel-card">
      <h3 className="h6 font-weight-bold mb-3">{t('checkout.payment_title')}</h3>
      <p className="small text-muted mb-4">
        {t('checkout.payment_tap_note')}
      </p>
      <div className="form-group">
        <label>{t('checkout.cardholder')}</label>
        <input
          className="form-control"
          required
          value={cardholder}
          onChange={(e) => setCardholder(e.target.value)}
          placeholder={t('checkout.cardholder_ph')}
        />
      </div>
      <div className="form-group">
        <label>{t('checkout.card_number')}</label>
        <input
          className="form-control"
          required
          inputMode="numeric"
          value={number}
          onChange={(e) => setNumber(formatCardNumber(e.target.value))}
          placeholder="4242 4242 4242 4242"
          maxLength={19}
        />
      </div>
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>{t('checkout.expiry')}</label>
          <input
            className="form-control"
            required
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
          />
        </div>
        <div className="form-group col-md-6">
          <label>{t('checkout.cvc')}</label>
          <input
            className="form-control"
            required
            inputMode="numeric"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength={4}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-brand btn-block mt-3" disabled={busy}>
        {busy ? t('checkout.processing') : t('checkout.pay_amount', { amount, currency })}
      </button>
    </form>
  );
}
