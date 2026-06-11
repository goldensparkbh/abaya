import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const PLATFORM_DOC = 'platformSettings/default';
const PAYMENT_DOC = 'paymentSettings/tap';

export async function getPlatformSettings() {
  const snap = await getDoc(doc(db, PLATFORM_DOC));
  return snap.exists()
    ? snap.data()
    : {
        currency: 'BHD',
        customDesignFee: 25,
        measurementGuideUrl: '/img/measurement-guide.svg',
        shippingFee: 2,
      };
}

export async function savePlatformSettings(data) {
  await setDoc(doc(db, PLATFORM_DOC), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getPaymentGatewaySettings() {
  const snap = await getDoc(doc(db, PAYMENT_DOC));
  return snap.exists()
    ? snap.data()
    : {
        provider: 'tap',
        enabled: false,
        mode: 'sandbox',
        publicKey: '',
        secretKey: '',
        merchantId: '',
        webhookSecret: '',
      };
}

export async function savePaymentGatewaySettings(data) {
  await setDoc(doc(db, PAYMENT_DOC), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function listMaterials(activeOnly = false) {
  const snap = await getDocs(query(collection(db, 'materials'), orderBy('sortOrder', 'asc')));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return activeOnly ? rows.filter((r) => r.active !== false) : rows;
}

export async function saveMaterial(id, data) {
  const ref = id ? doc(db, 'materials', id) : doc(collection(db, 'materials'));
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function listColors(activeOnly = false) {
  const snap = await getDocs(query(collection(db, 'colors'), orderBy('sortOrder', 'asc')));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return activeOnly ? rows.filter((r) => r.active !== false) : rows;
}

export async function saveColor(id, data) {
  const ref = id ? doc(db, 'colors', id) : doc(collection(db, 'colors'));
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function listAbayaModels(activeOnly = false) {
  const snap = await getDocs(query(collection(db, 'abayaModels'), orderBy('sortOrder', 'asc')));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return activeOnly ? rows.filter((r) => r.active !== false) : rows;
}

export async function saveAbayaModel(id, data) {
  const ref = id ? doc(db, 'abayaModels', id) : doc(collection(db, 'abayaModels'));
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function deleteAbayaModel(id) {
  await deleteDoc(doc(db, 'abayaModels', id));
}

export async function listEmailTemplates() {
  const snap = await getDocs(collection(db, 'emailTemplates'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveEmailTemplate(id, data) {
  const ref = id ? doc(db, 'emailTemplates', id) : doc(collection(db, 'emailTemplates'));
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function listWhatsAppTemplates() {
  const snap = await getDocs(collection(db, 'whatsappTemplates'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveWhatsAppTemplate(id, data) {
  const ref = id ? doc(db, 'whatsappTemplates', id) : doc(collection(db, 'whatsappTemplates'));
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function seedDefaultSettings() {
  const materials = await listMaterials();
  if (!materials.length) {
    const defaults = [
      { name: 'Crepe', nameAr: 'كريب', description: 'Lightweight matte crepe', priceModifier: 0, active: true, sortOrder: 1 },
      { name: 'Nida', nameAr: 'ندى', description: 'Premium nida fabric', priceModifier: 5, active: true, sortOrder: 2 },
      { name: 'Chiffon', nameAr: 'شيفون', description: 'Sheer layered chiffon', priceModifier: 8, active: true, sortOrder: 3 },
      { name: 'Linen', nameAr: 'كتان', description: 'Breathable linen blend', priceModifier: 3, active: true, sortOrder: 4 },
    ];
    for (const m of defaults) await saveMaterial(null, m);
  }

  const colors = await listColors();
  if (!colors.length) {
    const defaults = [
      { name: 'Black', nameAr: 'أسود', hex: '#1c1c1e', active: true, sortOrder: 1 },
      { name: 'Navy', nameAr: 'كحلي', hex: '#1f2a44', active: true, sortOrder: 2 },
      { name: 'Stone Beige', nameAr: 'بيج', hex: '#b8a994', active: true, sortOrder: 3 },
      { name: 'Plum', nameAr: 'برقوقي', hex: '#5a2d3b', active: true, sortOrder: 4 },
    ];
    for (const c of defaults) await saveColor(null, c);
  }

  const models = await listAbayaModels();
  if (!models.length) {
    const defaults = [
      { name: 'Classic Closed', nameAr: 'كلاسيكية مغلقة', description: 'Traditional closed-front silhouette', imageUrl: '/img/placeholder-product.svg', active: true, sortOrder: 1 },
      { name: 'Open Front', nameAr: 'مفتوحة أمامية', description: 'Layered open-front style', imageUrl: '/img/placeholder-product.svg', active: true, sortOrder: 2 },
      { name: 'Butterfly Cut', nameAr: 'قصة الفراشة', description: 'Wide butterfly sleeve cut', imageUrl: '/img/placeholder-product.svg', active: true, sortOrder: 3 },
    ];
    for (const m of defaults) await saveAbayaModel(null, m);
  }

  const emails = await listEmailTemplates();
  if (!emails.length) {
    const defaults = [
      {
        key: 'order_confirmation',
        name: 'Order confirmation',
        subject: 'Your order #{orderId} is confirmed',
        subjectAr: 'تم تأكيد طلبك #{orderId}',
        body: 'Hello {customerName},\n\nThank you for your order. We are processing it and will update you soon.\n\nOrder total: {total} {currency}',
        bodyAr: 'مرحباً {customerName}،\n\nشكراً لطلبك. نحن نعمل على معالجته وسنبلغك قريباً.\n\nإجمالي الطلب: {total} {currency}',
        enabled: true,
      },
      {
        key: 'custom_design_confirmation',
        name: 'Custom design confirmation',
        subject: 'We received your custom abaya design request',
        subjectAr: 'استلمنا طلب تصميم العباية الخاص بك',
        body: 'Hello {customerName},\n\nThank you for your custom design order #{orderId}. Our team will review your measurements and reference images. We will contact you if we need any clarification.\n\nTotal paid: {total} {currency}',
        bodyAr: 'مرحباً {customerName}،\n\nشكراً لطلب التصميم الخاص #{orderId}. سيقوم فريقنا بمراجعة مقاساتك وصورك المرجعية. سنتواصل معك إذا احتجنا أي توضيح.\n\nالمبلغ المدفوع: {total} {currency}',
        enabled: true,
      },
      {
        key: 'payment_received',
        name: 'Payment received',
        subject: 'Payment received for order #{orderId}',
        subjectAr: 'تم استلام الدفع للطلب #{orderId}',
        body: 'Hello {customerName},\n\nWe have received your payment of {total} {currency} for order #{orderId}.',
        bodyAr: 'مرحباً {customerName}،\n\nتم استلام دفعتك بمبلغ {total} {currency} للطلب #{orderId}.',
        enabled: true,
      },
    ];
    for (const e of defaults) await saveEmailTemplate(e.key, e);
  }

  const wa = await listWhatsAppTemplates();
  if (!wa.length) {
    const defaults = [
      {
        key: 'order_confirmation',
        name: 'Order confirmation',
        template: 'Hello {customerName}, your order #{orderId} is confirmed. Total: {total} {currency}. Thank you for shopping with Abaya Boutique.',
        templateAr: 'مرحباً {customerName}، تم تأكيد طلبك #{orderId}. الإجمالي: {total} {currency}. شكراً لتسوقك معنا.',
        enabled: true,
      },
      {
        key: 'custom_design_received',
        name: 'Custom design received',
        template: 'Hello {customerName}, we received your custom abaya design request #{orderId}. Our team will review it and contact you if needed.',
        templateAr: 'مرحباً {customerName}، استلمنا طلب تصميم العباية #{orderId}. سيقوم فريقنا بمراجعته والتواصل معك عند الحاجة.',
        enabled: true,
      },
    ];
    for (const w of defaults) await saveWhatsAppTemplate(w.key, w);
  }
}
