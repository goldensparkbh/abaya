/**
 * Seeds demo users, shops, products (with AI images), and platform settings.
 * Run: npm run seed
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_IMG_DIR = resolve(__dirname, '../public/img/seed');

function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  if (!existsSync(envPath)) return {};
  const raw = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCldQiowmprz2YJeNdKagiAC66yr4REm0Y',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'abaya-bh.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'abaya-bh',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'abaya-bh.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '454582903029',
  appId: env.VITE_FIREBASE_APP_ID || '1:454582903029:web:4be7f3d04032e1ea8025bc',
};

export const DEMO_USERS = {
  customer: {
    email: 'customer@demo.abaya.bh',
    password: 'AbayaDemo2026!',
    displayName: 'Fatima Al Khalifa',
    mobile: '+97339001001',
    role: 'customer',
  },
  shop: {
    email: 'shop@demo.abaya.bh',
    password: 'AbayaDemo2026!',
    displayName: 'Sara Al Noor',
    mobile: '+97339002002',
    role: 'business',
    shopName: 'Al Noor Atelier',
    shopDescription: 'Elegant everyday and occasion abayas crafted in Manama.',
  },
  admin: {
    email: 'admin@demo.abaya.bh',
    password: 'AbayaDemo2026!',
    displayName: 'Platform Admin',
    mobile: '+97339003003',
    role: 'admin',
  },
};

const PRODUCTS = [
  {
    slug: 'product-classic-crepe',
    name: 'Classic Closed Crepe Abaya',
    description: 'Matte crepe abaya with clean lines and hidden snap closure. Perfect for daily wear.',
    price: 28,
    category: 'Everyday',
    sizes: ['52', '54', '56', '58'],
    colors: ['Black', 'Navy'],
    stock: 20,
  },
  {
    slug: 'product-embroidered-sleeve',
    name: 'Embroidered Sleeve Abaya',
    description: 'Soft nida fabric with delicate gold embroidery on sleeves and cuffs.',
    price: 45,
    category: 'Occasion',
    sizes: ['54', '56', '58'],
    colors: ['Black', 'Stone Beige'],
    stock: 12,
  },
  {
    slug: 'product-open-front',
    name: 'Open Front Layered Abaya',
    description: 'Layered chiffon open abaya with inner slip. Light and flowing.',
    price: 38,
    category: 'Modern',
    sizes: ['Free size', '56', '58'],
    colors: ['Plum', 'Black'],
    stock: 15,
  },
  {
    slug: 'product-formal-butterfly',
    name: 'Formal Butterfly Abaya',
    description: 'Structured butterfly cut in premium linen blend for formal events.',
    price: 52,
    category: 'Formal',
    sizes: ['54', '56'],
    colors: ['Navy', 'Black'],
    stock: 8,
  },
];

const SEED_ASSETS = {
  shopLogo: 'shop-al-noor-logo.png',
  measurementGuide: 'measurement-guide-ai.png',
};

function readSeedImage(filename) {
  const path = join(SEED_IMG_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(`Missing seed image: ${path}. Run image generation first.`);
  }
  return readFileSync(path);
}

function localSeedUrl(filename) {
  return `/img/seed/${filename}`;
}

async function uploadSeedImage(storage, shopUid, filename, storagePath) {
  const bytes = readSeedImage(filename);
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, bytes, { contentType: 'image/png' });
  return getDownloadURL(storageRef);
}

async function resolveImageUrl(storage, shopUid, filename, storagePath) {
  try {
    const url = await uploadSeedImage(storage, shopUid, filename, storagePath);
    console.log(`    ↑ uploaded ${filename}`);
    return url;
  } catch (e) {
    console.warn(`    ⚠ upload failed for ${filename}, using local path (${e.message})`);
    return localSeedUrl(filename);
  }
}

async function ensureUser(auth, db, spec) {
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, spec.email, spec.password);
    uid = cred.user.uid;
    await updateProfile(cred.user, { displayName: spec.displayName });
    console.log(`  Created user: ${spec.email}`);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, spec.email, spec.password);
      uid = cred.user.uid;
      console.log(`  User exists: ${spec.email}`);
    } else {
      throw e;
    }
  }

  await setDoc(
    doc(db, 'users', uid),
    {
      displayName: spec.displayName,
      email: spec.email,
      mobile: spec.mobile,
      role: spec.role,
      ...(spec.shopName ? { shopName: spec.shopName } : {}),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return uid;
}

async function seedShopAndProducts(storage, db, shopSpec, shopUid) {
  console.log('  Uploading shop logo…');
  const logoUrl = await resolveImageUrl(
    storage,
    shopUid,
    SEED_ASSETS.shopLogo,
    `products/${shopUid}/shop-logo.png`
  );

  await setDoc(
    doc(db, 'shops', shopUid),
    {
      userId: shopUid,
      shopName: shopSpec.shopName,
      description: shopSpec.shopDescription,
      logo: logoUrl,
      status: 'active',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`  Shop profile: ${shopSpec.shopName}`);

  const existingSnap = await getDocs(
    query(collection(db, 'products'), where('shopId', '==', shopUid))
  );
  const existing = existingSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log('  Uploading product images…');
  const imageUrls = {};
  for (const p of PRODUCTS) {
    imageUrls[p.slug] = await resolveImageUrl(
      storage,
      shopUid,
      `${p.slug}.png`,
      `products/${shopUid}/${p.slug}.png`
    );
  }

  if (existing.length >= PRODUCTS.length) {
    console.log(`  Updating ${existing.length} existing products with AI images…`);
    for (const docRow of existing) {
      const match = PRODUCTS.find((p) => p.name === docRow.name);
      const image = match ? imageUrls[match.slug] : Object.values(imageUrls)[0];
      await updateDoc(doc(db, 'products', docRow.id), {
        images: [image],
        updatedAt: serverTimestamp(),
      });
    }
    return;
  }

  for (const p of PRODUCTS) {
    await addDoc(collection(db, 'products'), {
      shopId: shopUid,
      shopName: shopSpec.shopName,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: 'BHD',
      images: [imageUrls[p.slug]],
      category: p.category,
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  console.log(`  Added ${PRODUCTS.length} products with AI images`);
}

async function seedPlatformSettings(storage, db, adminUid) {
  console.log('  Uploading measurement guide…');
  const guideUrl = await resolveImageUrl(
    storage,
    adminUid,
    SEED_ASSETS.measurementGuide,
    'settings/measurement-guide-ai.png'
  );

  await setDoc(
    doc(db, 'platformSettings', 'default'),
    {
      currency: 'BHD',
      customDesignFee: 25,
      measurementGuideUrl: guideUrl,
      shippingFee: 2,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, 'paymentSettings', 'tap'),
    {
      provider: 'tap',
      enabled: false,
      mode: 'sandbox',
      publicKey: '',
      secretKey: '',
      merchantId: '',
      webhookSecret: '',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const materials = [
    { name: 'Crepe', nameAr: 'كريب', description: 'Lightweight matte crepe', priceModifier: 0, active: true, sortOrder: 1 },
    { name: 'Nida', nameAr: 'ندى', description: 'Premium nida fabric', priceModifier: 5, active: true, sortOrder: 2 },
    { name: 'Chiffon', nameAr: 'شيفون', description: 'Sheer layered chiffon', priceModifier: 8, active: true, sortOrder: 3 },
    { name: 'Linen', nameAr: 'كتان', description: 'Breathable linen blend', priceModifier: 3, active: true, sortOrder: 4 },
  ];
  const matSnap = await getDocs(collection(db, 'materials'));
  if (!matSnap.size) {
    for (const m of materials) {
      await addDoc(collection(db, 'materials'), { ...m, updatedAt: serverTimestamp() });
    }
    console.log(`  Added ${materials.length} materials`);
  }

  const colors = [
    { name: 'Black', nameAr: 'أسود', hex: '#1c1c1e', active: true, sortOrder: 1 },
    { name: 'Navy', nameAr: 'كحلي', hex: '#1f2a44', active: true, sortOrder: 2 },
    { name: 'Stone Beige', nameAr: 'بيج', hex: '#b8a994', active: true, sortOrder: 3 },
    { name: 'Plum', nameAr: 'برقوقي', hex: '#5a2d3b', active: true, sortOrder: 4 },
  ];
  const colSnap = await getDocs(collection(db, 'colors'));
  if (!colSnap.size) {
    for (const c of colors) {
      await addDoc(collection(db, 'colors'), { ...c, updatedAt: serverTimestamp() });
    }
    console.log(`  Added ${colors.length} colours`);
  }

  console.log('  Platform settings saved (AI measurement guide)');
}

async function main() {
  console.log('\n🌱 Seeding Abaya Boutique demo data (with AI images)…\n');
  console.log(`Project: ${firebaseConfig.projectId}\n`);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  console.log('1. Demo users');
  const customerUid = await ensureUser(auth, db, DEMO_USERS.customer);
  const shopUid = await ensureUser(auth, db, DEMO_USERS.shop);
  const adminUid = await ensureUser(auth, db, DEMO_USERS.admin);

  console.log('\n2. Shop, AI product images & listings');
  await signInWithEmailAndPassword(auth, DEMO_USERS.shop.email, DEMO_USERS.shop.password);
  await seedShopAndProducts(storage, db, DEMO_USERS.shop, shopUid);

  console.log('\n3. Platform settings & AI measurement guide (as admin)');
  await signInWithEmailAndPassword(auth, DEMO_USERS.admin.email, DEMO_USERS.admin.password);
  await seedPlatformSettings(storage, db, adminUid);

  console.log('\n✅ Seed complete!\n');
  console.log('┌──────────┬─────────────────────────┬──────────────────┐');
  console.log('│ Role     │ Email                   │ Password         │');
  console.log('├──────────┼─────────────────────────┼──────────────────┤');
  console.log('│ Customer │ customer@demo.abaya.bh  │ AbayaDemo2026!   │');
  console.log('│ Shop     │ shop@demo.abaya.bh      │ AbayaDemo2026!   │');
  console.log('│ Admin    │ admin@demo.abaya.bh     │ AbayaDemo2026!   │');
  console.log('└──────────┴─────────────────────────┴──────────────────┘');
  console.log('\nAI assets seeded:');
  console.log('  • 4 product photos (+ shop logo + measurement guide)');
  console.log('  • Al Noor Atelier shop logo');
  console.log('  • Custom design measurement guide');
  console.log(`\nLocal copies: web/public/img/seed/\n`);
  console.log(`Customer UID: ${customerUid}`);
  console.log(`Shop UID:     ${shopUid}`);
  console.log(`Admin UID:    ${adminUid}\n`);
}

main().catch((e) => {
  console.error('\n❌ Seed failed:', e.message || e);
  process.exit(1);
});
