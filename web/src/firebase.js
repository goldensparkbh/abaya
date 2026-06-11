import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function trimEnv(v) {
  if (v == null || typeof v !== 'string') return '';
  let s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

const firebaseConfig = {
  apiKey: trimEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: trimEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: trimEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: trimEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: trimEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: trimEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

function missingConfig() {
  return !firebaseConfig.apiKey || !firebaseConfig.projectId;
}

let app;
let auth;
let db;
let storage;

if (!missingConfig()) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  if (firebaseConfig.storageBucket) {
    storage = getStorage(app);
  }
}

export { app, auth, db, storage, missingConfig };
