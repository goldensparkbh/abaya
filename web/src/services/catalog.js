import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export async function getShop(shopId) {
  const snap = await getDoc(doc(db, 'shops', shopId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listShops(activeOnly = true) {
  const snap = await getDocs(query(collection(db, 'shops'), orderBy('shopName', 'asc')));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return activeOnly ? rows.filter((s) => s.status !== 'suspended') : rows;
}

export async function upsertShop(shopId, data) {
  const ref = doc(db, 'shops', shopId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...data, status: 'active', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function ensureShopProfile(user) {
  const existing = await getShop(user.uid);
  if (existing) return existing;
  const shop = {
    userId: user.uid,
    shopName: user.shopName || user.displayName || 'Shop',
    description: '',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'shops', user.uid), shop);
  return { id: user.uid, ...shop };
}

export async function getProduct(productId) {
  const snap = await getDoc(doc(db, 'products', productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listProducts({ shopId, activeOnly = true, limit } = {}) {
  let q;
  if (shopId) {
    q = query(collection(db, 'products'), where('shopId', '==', shopId), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (activeOnly) rows = rows.filter((p) => p.active !== false);
  return limit ? rows.slice(0, limit) : rows;
}

export async function createProduct(shopId, shopName, data) {
  const ref = await addDoc(collection(db, 'products'), {
    shopId,
    shopName,
    name: data.name,
    description: data.description || '',
    price: Number(data.price),
    currency: data.currency || 'BHD',
    images: data.images || [],
    category: data.category || '',
    sizes: data.sizes || ['Free size'],
    colors: data.colors || [],
    stock: Number(data.stock ?? 99),
    active: data.active !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(productId, data) {
  await updateDoc(doc(db, 'products', productId), { ...data, updatedAt: serverTimestamp() });
}

export async function listCategories() {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('sortOrder', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function shopsById(shops) {
  return Object.fromEntries(shops.map((s) => [s.id, s]));
}

export function attachShopLogos(products, shopMap) {
  return products.map((p) => ({
    ...p,
    shopLogo: shopMap[p.shopId]?.logo || null,
  }));
}

export async function updateShopLogo(shopId, logoUrl) {
  await upsertShop(shopId, { logo: logoUrl });
}

export async function saveShopAdmin(shopId, data) {
  const ref = doc(db, 'shops', shopId);
  const snap = await getDoc(ref);
  const payload = {
    userId: shopId,
    shopName: data.shopName?.trim() || 'Shop',
    description: data.description?.trim() || '',
    status: data.status || 'active',
    updatedAt: serverTimestamp(),
    ...(data.logo ? { logo: data.logo } : {}),
  };
  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
  }
}

export async function deleteShop(shopId) {
  const products = await listProducts({ shopId, activeOnly: false });
  if (products.length) {
    const batch = writeBatch(db);
    products.forEach((p) => batch.delete(doc(db, 'products', p.id)));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'shops', shopId));
}
