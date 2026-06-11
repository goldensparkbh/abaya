import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';

/** Status lifecycle for a request. */
export const REQUEST_STATUS = {
  open: 'Open for bids',
  awarded: 'Awarded — awaiting payment',
  paid: 'Funds in escrow',
  in_progress: 'In production',
  delivered: 'Delivered — awaiting release',
  completed: 'Completed',
  disputed: 'Dispute open',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ACTIVE_STATUSES = ['open', 'awarded', 'paid', 'in_progress', 'delivered'];

export function statusBadgeClass(status) {
  switch (status) {
    case 'open':
      return 'badge-open';
    case 'awarded':
      return 'badge-awarded';
    case 'paid':
    case 'in_progress':
      return 'badge-progress';
    case 'delivered':
      return 'badge-delivered';
    case 'completed':
      return 'badge-done';
    case 'disputed':
      return 'badge-warn';
    case 'cancelled':
    case 'refunded':
      return 'badge-muted';
    default:
      return 'badge-muted';
  }
}

async function logEvent(requestId, type, by, note) {
  await addDoc(collection(db, 'requests', requestId, 'events'), {
    type,
    by,
    note: note || null,
    createdAt: serverTimestamp(),
  });
}

/* -------------------- Requests -------------------- */

export async function createRequest(payload) {
  const ref = await addDoc(collection(db, 'requests'), {
    ...payload,
    status: 'open',
    bidCount: 0,
    currency: payload.currency || 'BHD',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logEvent(ref.id, 'created', payload.customerId, 'Request posted for bids');
  return ref.id;
}

export function subscribeRequest(requestId, callback) {
  return onSnapshot(doc(db, 'requests', requestId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export function subscribeMyRequests(customerId, callback) {
  const q = query(collection(db, 'requests'), where('customerId', '==', customerId));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(rows);
  });
}

export function subscribeOpenRequests(callback) {
  const q = query(collection(db, 'requests'), where('status', '==', 'open'));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(rows);
  });
}

export function subscribeAwardedRequestsForShop(shopId, callback) {
  const q = query(collection(db, 'requests'), where('awardedShopId', '==', shopId));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(rows);
  });
}

export async function updateRequest(requestId, patch, by) {
  await updateDoc(doc(db, 'requests', requestId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
  if (by && patch.status) {
    await logEvent(requestId, `status:${patch.status}`, by);
  }
}

export async function cancelRequest(requestId, by) {
  await updateRequest(requestId, { status: 'cancelled' }, by);
}

/* -------------------- Bids -------------------- */

export function subscribeBids(requestId, callback) {
  const q = query(collection(db, 'requests', requestId, 'bids'), orderBy('price', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function placeBid(requestId, { shopId, shopName, price, leadTimeDays, note }) {
  const existing = await getDocs(
    query(collection(db, 'requests', requestId, 'bids'), where('shopId', '==', shopId), limit(1))
  );
  if (!existing.empty) {
    const ref = existing.docs[0].ref;
    await updateDoc(ref, {
      price: Number(price),
      leadTimeDays: Number(leadTimeDays),
      note: note || '',
      status: 'pending',
      updatedAt: serverTimestamp(),
    });
    await logEvent(requestId, 'bid:updated', shopId, `${shopName} updated their bid`);
    return ref.id;
  }
  const ref = await addDoc(collection(db, 'requests', requestId, 'bids'), {
    shopId,
    shopName,
    price: Number(price),
    leadTimeDays: Number(leadTimeDays),
    note: note || '',
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  const reqRef = doc(db, 'requests', requestId);
  const reqSnap = await getDoc(reqRef);
  const count = (reqSnap.exists() ? reqSnap.data().bidCount || 0 : 0) + 1;
  await updateDoc(reqRef, { bidCount: count, updatedAt: serverTimestamp() });
  await logEvent(requestId, 'bid:placed', shopId, `${shopName} placed a bid`);
  return ref.id;
}

export async function withdrawBid(requestId, bidId, shopId) {
  await updateDoc(doc(db, 'requests', requestId, 'bids', bidId), { status: 'withdrawn' });
  await logEvent(requestId, 'bid:withdrawn', shopId);
}

export async function awardBid(requestId, bid, customerId) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(bid.leadTimeDays));
  await updateRequest(
    requestId,
    {
      status: 'awarded',
      awardedBidId: bid.id,
      awardedShopId: bid.shopId,
      awardedShopName: bid.shopName,
      awardedPrice: Number(bid.price),
      awardedLeadTimeDays: Number(bid.leadTimeDays),
      awardedDueDate: dueDate.toISOString(),
    },
    customerId
  );
  await updateDoc(doc(db, 'requests', requestId, 'bids', bid.id), { status: 'awarded' });
  await logEvent(requestId, 'awarded', customerId, `Awarded to ${bid.shopName} at ${bid.price}`);
}

/** Fetch the bids a single shop has placed, across all requests. */
export async function listBidsForShop(shopId) {
  const q = query(collectionGroup(db, 'bids'), where('shopId', '==', shopId));
  const snap = await getDocs(q);
  const out = [];
  for (const d of snap.docs) {
    out.push({ id: d.id, requestId: d.ref.parent.parent.id, ...d.data() });
  }
  out.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return out;
}

/* -------------------- Messages -------------------- */

export function subscribeMessages(requestId, callback) {
  return onSnapshot(collection(db, 'requests', requestId, 'messages'), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    callback(rows);
  });
}

export async function sendMessage(requestId, { senderId, senderRole, senderName, text }) {
  if (!text || !text.trim()) return;
  await addDoc(collection(db, 'requests', requestId, 'messages'), {
    senderId,
    senderRole,
    senderName,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

/* -------------------- Escrow / payment -------------------- */

export function subscribePayment(requestId, callback) {
  return onSnapshot(doc(db, 'requests', requestId, 'payment', 'escrow'), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function simulateDummyCardCharge({ amount, currency }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        reference: `ESCROW-${Date.now().toString(36).toUpperCase()}`,
        method: 'dummy_card',
        status: 'held',
        amount: Number(amount),
        currency,
        processedAt: new Date().toISOString(),
      });
    }, 1200);
  });
}

export async function fundEscrow(requestId, customerId, payment) {
  await setDoc(doc(db, 'requests', requestId, 'payment', 'escrow'), {
    ...payment,
    state: 'held',
    fundedAt: serverTimestamp(),
  });
  await updateRequest(requestId, { status: 'paid', paidAt: serverTimestamp() }, customerId);
  await logEvent(requestId, 'escrow:funded', customerId, `Funds held in escrow`);
}

export async function shopStart(requestId, shopId) {
  await updateRequest(requestId, { status: 'in_progress', inProgressAt: serverTimestamp() }, shopId);
}

export async function shopMarkDelivered(requestId, shopId) {
  await updateRequest(requestId, { status: 'delivered', deliveredAt: serverTimestamp() }, shopId);
}

export async function releaseEscrow(requestId, customerId) {
  await updateDoc(doc(db, 'requests', requestId, 'payment', 'escrow'), {
    state: 'released',
    releasedAt: serverTimestamp(),
  });
  await updateRequest(requestId, { status: 'completed', completedAt: serverTimestamp() }, customerId);
  await logEvent(requestId, 'escrow:released', customerId, 'Funds released to shop');
}

/* -------------------- Disputes -------------------- */

export function subscribeDisputes(requestId, callback) {
  return onSnapshot(collection(db, 'requests', requestId, 'disputes'), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(rows);
  });
}

export async function openDispute(requestId, { uid, role, name, reason }) {
  await addDoc(collection(db, 'requests', requestId, 'disputes'), {
    raisedBy: uid,
    raisedByRole: role,
    raisedByName: name,
    reason: (reason || '').trim(),
    status: 'open',
    createdAt: serverTimestamp(),
  });
  await updateRequest(requestId, { status: 'disputed' }, uid);
  await logEvent(requestId, 'dispute:opened', uid, reason || null);
}

export async function resolveDispute(requestId, disputeId, { adminId, decision, note }) {
  await updateDoc(doc(db, 'requests', requestId, 'disputes', disputeId), {
    status: decision === 'release' ? 'resolved_release' : 'resolved_refund',
    resolution: note || '',
    resolvedBy: adminId,
    resolvedAt: serverTimestamp(),
  });
  if (decision === 'release') {
    await updateDoc(doc(db, 'requests', requestId, 'payment', 'escrow'), {
      state: 'released',
      releasedAt: serverTimestamp(),
      releasedBy: 'admin',
    }).catch(() => null);
    await updateRequest(requestId, { status: 'completed', completedAt: serverTimestamp() }, adminId);
  } else {
    await updateDoc(doc(db, 'requests', requestId, 'payment', 'escrow'), {
      state: 'refunded',
      refundedAt: serverTimestamp(),
      refundedBy: 'admin',
    }).catch(() => null);
    await updateRequest(requestId, { status: 'refunded' }, adminId);
  }
  await logEvent(requestId, `dispute:${decision}`, adminId, note || null);
}

/** Admin helper — list every dispute on every request. */
export async function listAllDisputes() {
  const snap = await getDocs(collectionGroup(db, 'disputes'));
  return snap.docs.map((d) => ({
    id: d.id,
    requestId: d.ref.parent.parent.id,
    ...d.data(),
  }));
}

/* -------------------- Events -------------------- */

export function subscribeEvents(requestId, callback) {
  return onSnapshot(collection(db, 'requests', requestId, 'events'), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(rows);
  });
}
