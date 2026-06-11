import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigBanner from '../components/ConfigBanner.jsx';
import PaymentForm from '../components/PaymentForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { createProductOrder, updateOrderPayment } from '../services/orders.js';
import { processPayment } from '../services/payment.js';
import { queueOrderNotifications } from '../services/notifications.js';
import { getPlatformSettings } from '../services/settings.js';
import { db } from '../firebase.js';
import { useT } from '../i18n/I18nContext.jsx';

export default function Checkout() {
  const t = useT();
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [shipping, setShipping] = useState({ name: '', mobile: '', address: '', city: '', country: 'Bahrain' });
  const [platform, setPlatform] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (profile) {
      setShipping((s) => ({
        ...s,
        name: profile.displayName || '',
        mobile: profile.mobile || '',
      }));
    }
    if (db) getPlatformSettings().then(setPlatform);
  }, [profile]);

  if (!db) {
    return (
      <div className="container content-page">
        <ConfigBanner />
      </div>
    );
  }

  if (!user) {
    nav('/login');
    return null;
  }

  if (!items.length) {
    nav('/cart');
    return null;
  }

  const shippingFee = platform?.shippingFee ?? 2;
  const total = subtotal + shippingFee;
  const currency = platform?.currency || 'BHD';

  async function onPay(card) {
    setErr('');
    if (!shipping.name || !shipping.mobile || !shipping.address) {
      setErr(t('checkout.err_address'));
      return;
    }
    setBusy(true);
    try {
      const orderId = await createProductOrder({
        customer: {
          id: user.uid,
          name: shipping.name,
          email: user.email,
          mobile: shipping.mobile,
        },
        items,
        shippingAddress: shipping,
        totals: { subtotal, shipping: shippingFee, total },
        currency,
      });

      const payment = await processPayment({
        orderId,
        amount: total,
        currency,
        customer: { name: shipping.name, email: user.email, mobile: shipping.mobile },
        card,
        description: `Order ${orderId}`,
      });

      await updateOrderPayment(orderId, payment);
      await queueOrderNotifications({
        order: {
          id: orderId,
          customerName: shipping.name,
          customerEmail: user.email,
          customerMobile: shipping.mobile,
          total,
          currency,
        },
        type: 'product',
      });

      clear();
      nav(`/order-confirmation/${orderId}`);
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container content-page px-3 px-md-4">
      <h1 className="cart-page-title mb-4">{t('checkout.title')}</h1>
      {err ? <div className="alert alert-danger">{err}</div> : null}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="panel-card">
            <h3 className="h6 font-weight-bold mb-3">{t('checkout.shipping')}</h3>
            <div className="form-group">
              <label>{t('checkout.full_name')}</label>
              <input className="form-control" required value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t('checkout.mobile')}</label>
              <input className="form-control" required value={shipping.mobile} onChange={(e) => setShipping({ ...shipping, mobile: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t('checkout.address')}</label>
              <textarea className="form-control" rows={3} required value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>{t('checkout.city')}</label>
                <input className="form-control" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
              </div>
              <div className="form-group col-md-6">
                <label>{t('checkout.country')}</label>
                <input className="form-control" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
              </div>
            </div>
            <div className="border-top pt-3 mt-2">
              <div className="d-flex justify-content-between small mb-1"><span>{t('cart.subtotal')}</span><span>{subtotal.toFixed(2)} {currency}</span></div>
              <div className="d-flex justify-content-between small mb-1"><span>{t('checkout.shipping_fee')}</span><span>{shippingFee.toFixed(2)} {currency}</span></div>
              <div className="d-flex justify-content-between font-weight-bold"><span>{t('checkout.total')}</span><span>{total.toFixed(2)} {currency}</span></div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <PaymentForm onSubmit={onPay} busy={busy} amount={total.toFixed(2)} currency={currency} />
        </div>
      </div>
    </div>
  );
}
