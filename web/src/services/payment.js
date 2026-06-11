import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getPaymentGatewaySettings } from './settings.js';

/**
 * TAP Payment integration.
 * Production: set VITE_PAYMENT_API_URL to your Cloud Function / backend that calls TAP APIs.
 * Sandbox/demo: when gateway is disabled or API URL missing, uses simulated charge.
 */
export async function processPayment({ orderId, amount, currency, customer, card, description }) {
  const gateway = await getPaymentGatewaySettings();
  const apiUrl = (import.meta.env.VITE_PAYMENT_API_URL || '').trim();

  if (gateway.enabled && apiUrl) {
    const res = await fetch(`${apiUrl}/charges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount,
        currency: currency || 'BHD',
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.mobile,
        },
        card,
        description,
        gateway: {
          provider: 'tap',
          mode: gateway.mode,
          merchantId: gateway.merchantId,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Payment failed. Please try again.');
    }
    return res.json();
  }

  return simulateTapCharge({ orderId, amount, currency, customer, card });
}

async function simulateTapCharge({ orderId, amount, currency, customer, card }) {
  await new Promise((r) => setTimeout(r, 1400));

  if (!card?.number || card.number.replace(/\s/g, '').length < 12) {
    throw new Error('Invalid card number');
  }

  const last4 = card.number.replace(/\s/g, '').slice(-4);
  const reference = `TAP-SIM-${Date.now().toString(36).toUpperCase()}`;

  const payment = {
    provider: 'tap',
    method: 'card',
    status: 'captured',
    reference,
    tapChargeId: reference,
    amount,
    currency: currency || 'BHD',
    cardLast4: last4,
    cardholder: card.cardholder || customer.name,
    mode: 'sandbox',
    paidAt: new Date().toISOString(),
  };

  await addDoc(collection(db, 'paymentLogs'), {
    orderId,
    ...payment,
    customerEmail: customer.email,
    createdAt: serverTimestamp(),
  });

  return payment;
}

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}
