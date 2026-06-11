import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { listEmailTemplates, listWhatsAppTemplates } from './settings.js';

function interpolate(template, vars) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v ?? '')), template);
}

export async function queueOrderNotifications({ order, type }) {
  const templates = await listEmailTemplates();
  const waTemplates = await listWhatsAppTemplates();

  const vars = {
    customerName: order.customerName,
    orderId: order.id,
    total: order.total,
    currency: order.currency || 'BHD',
  };

  const emailKey = type === 'custom_design' ? 'custom_design_confirmation' : 'order_confirmation';
  const emailTpl = templates.find((t) => t.key === emailKey && t.enabled);
  const paymentTpl = templates.find((t) => t.key === 'payment_received' && t.enabled);
  const waKey = type === 'custom_design' ? 'custom_design_received' : 'order_confirmation';
  const waTpl = waTemplates.find((t) => t.key === waKey && t.enabled);

  const jobs = [];

  if (emailTpl && order.customerEmail) {
    jobs.push(
      addDoc(collection(db, 'notificationQueue'), {
        channel: 'email',
        to: order.customerEmail,
        templateKey: emailKey,
        subject: interpolate(emailTpl.subject, vars),
        body: interpolate(emailTpl.body, vars),
        status: 'queued',
        orderId: order.id,
        createdAt: serverTimestamp(),
      })
    );
  }

  if (paymentTpl && order.customerEmail) {
    jobs.push(
      addDoc(collection(db, 'notificationQueue'), {
        channel: 'email',
        to: order.customerEmail,
        templateKey: 'payment_received',
        subject: interpolate(paymentTpl.subject, vars),
        body: interpolate(paymentTpl.body, vars),
        status: 'queued',
        orderId: order.id,
        createdAt: serverTimestamp(),
      })
    );
  }

  if (waTpl && order.customerMobile) {
    jobs.push(
      addDoc(collection(db, 'notificationQueue'), {
        channel: 'whatsapp',
        to: order.customerMobile,
        templateKey: waKey,
        body: interpolate(waTpl.template, vars),
        status: 'queued',
        orderId: order.id,
        createdAt: serverTimestamp(),
      })
    );
  }

  await Promise.all(jobs);
}

export async function listNotificationQueue(limit = 50) {
  const snap = await getDocs(query(collection(db, 'notificationQueue'), orderBy('createdAt', 'desc')));
  return snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...d.data() }));
}
