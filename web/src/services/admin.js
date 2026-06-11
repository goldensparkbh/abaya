import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { listAllOrders, listPayments } from './orders.js';
import { deleteShop, listProducts, listShops, saveShopAdmin } from './catalog.js';

export async function listAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return rows;
}

export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
}

export async function updateShopStatus(shopId, status) {
  await updateDoc(doc(db, 'shops', shopId), { status, updatedAt: serverTimestamp() });
}

export async function listShopOwnerCandidates() {
  const [users, shops] = await Promise.all([listAllUsers(), listShops(false)]);
  const shopIds = new Set(shops.map((s) => s.id));
  return users.filter((u) => {
    const role = u.role || 'customer';
    return (role === 'shop' || role === 'business') && !shopIds.has(u.id);
  });
}

export async function createShopAdmin({ userId, shopName, description, status, logo }) {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) throw new Error('User not found');
  const user = userSnap.data();
  const role = user.role || 'customer';
  if (role !== 'shop' && role !== 'business') {
    throw new Error('User must have shop role');
  }
  const existing = await getDoc(doc(db, 'shops', userId));
  if (existing.exists()) throw new Error('Shop already exists for this user');
  const name = shopName || user.shopName || user.displayName;
  await saveShopAdmin(userId, {
    shopName: name,
    description,
    status,
    logo,
  });
  await updateDoc(doc(db, 'users', userId), {
    shopName: name,
    updatedAt: serverTimestamp(),
  });
  return userId;
}

export async function updateShopAdmin(shopId, data) {
  await saveShopAdmin(shopId, data);
  if (data.shopName) {
    await updateDoc(doc(db, 'users', shopId), {
      shopName: data.shopName.trim(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deleteShopAdmin(shopId) {
  await deleteShop(shopId);
}

export async function getAdminOverview() {
  const [shops, products, orders, payments] = await Promise.all([
    listShops(false),
    listProducts({ activeOnly: false }),
    listAllOrders(),
    listPayments(),
  ]);

  const productOrders = orders.filter((o) => o.type === 'product');
  const customOrders = orders.filter((o) => o.type === 'custom_design');
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.payment?.status === 'captured');
  const revenue = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return {
    shopCount: shops.length,
    activeShops: shops.filter((s) => s.status === 'active').length,
    productCount: products.length,
    orderCount: orders.length,
    productOrderCount: productOrders.length,
    customDesignCount: customOrders.length,
    paidOrderCount: paidOrders.length,
    revenue,
    recentOrders: orders.slice(0, 10),
    payments: payments.slice(0, 10),
  };
}
