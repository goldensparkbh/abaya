import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export async function createProductOrder({ customer, items, shippingAddress, totals, currency }) {
  const ref = await addDoc(collection(db, 'orders'), {
    type: 'product',
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerMobile: customer.mobile || '',
    items: items.map((i) => ({
      productId: i.productId,
      shopId: i.shopId,
      shopName: i.shopName,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      size: i.size || '',
      color: i.color || '',
      image: i.image || '',
    })),
    shippingAddress,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
    currency,
    status: ORDER_STATUS.PENDING_PAYMENT,
    payment: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function createCustomDesignOrder({
  customer,
  measurements,
  model,
  material,
  color,
  notes,
  referenceImages,
  totals,
  currency,
}) {
  const ref = await addDoc(collection(db, 'orders'), {
    type: 'custom_design',
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerMobile: customer.mobile || '',
    measurements,
    modelId: model.id,
    modelName: model.name,
    modelImageUrl: model.imageUrl || '',
    materialId: material.id,
    materialName: material.name,
    colorId: color.id,
    colorName: color.name,
    colorHex: color.hex,
    notes: notes || '',
    referenceImages: referenceImages || [],
    subtotal: totals.subtotal,
    shipping: totals.shipping || 0,
    total: totals.total,
    currency,
    status: ORDER_STATUS.PENDING_PAYMENT,
    payment: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrder(orderId) {
  const snap = await getDoc(doc(db, 'orders', orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateOrderPayment(orderId, payment) {
  const ref = doc(db, 'orders', orderId);
  const snap = await getDoc(ref);
  const history = snap.exists() ? snap.data().statusHistory || [] : [];
  await updateDoc(ref, {
    payment,
    status: ORDER_STATUS.PAID,
    paidAt: serverTimestamp(),
    statusHistory: [
      ...history,
      { status: ORDER_STATUS.PAID, at: serverTimestamp(), by: 'system' },
    ],
    updatedAt: serverTimestamp(),
  });
}

export async function updateOrderStatus(orderId, status, meta = {}) {
  const ref = doc(db, 'orders', orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Order not found');
  const history = snap.data().statusHistory || [];
  const entry = {
    status,
    at: serverTimestamp(),
    ...(meta.by ? { by: meta.by } : {}),
    ...(meta.note ? { note: meta.note } : {}),
  };
  await updateDoc(ref, {
    status,
    statusHistory: [...history, entry],
    updatedAt: serverTimestamp(),
  });
}

export async function updateShopOrderStatus(orderId, shopId, status) {
  const order = await getOrder(orderId);
  if (!order || order.type !== 'product') throw new Error('Invalid order');
  if (!order.items?.some((i) => i.shopId === shopId)) throw new Error('Not your order');
  const allowed = [ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED];
  if (!allowed.includes(status)) throw new Error('Invalid status');
  await updateOrderStatus(orderId, status, { by: 'shop' });
}

export async function listCustomerOrders(customerId) {
  const snap = await getDocs(
    query(collection(db, 'orders'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listShopOrders(shopId) {
  const snap = await getDocs(query(collection(db, 'orders'), where('type', '==', 'product'), orderBy('createdAt', 'desc')));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((o) => o.items?.some((i) => i.shopId === shopId));
}

export async function listAllOrders() {
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listCustomDesignOrders() {
  const snap = await getDocs(
    query(collection(db, 'orders'), where('type', '==', 'custom_design'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listPayments() {
  const orders = await listAllOrders();
  return orders
    .filter((o) => o.payment)
    .map((o) => ({
      orderId: o.id,
      orderType: o.type,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      amount: o.total,
      currency: o.currency,
      status: o.payment.status,
      reference: o.payment.reference,
      method: o.payment.method,
      paidAt: o.paidAt || o.payment.paidAt,
    }));
}
