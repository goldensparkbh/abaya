import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, missingConfig } from '../firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (missingConfig() || !auth || !db) {
      setLoading(false);
      return undefined;
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            ...data,
            role: data.role || 'customer',
            displayName: data.displayName || u.displayName || '',
          });
        } else {
          setProfile({ role: 'customer', displayName: u.displayName || '' });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firebaseReady: !missingConfig() && !!auth,
      async registerAccount({ email, password, name, mobile, role = 'customer', shopName }) {
        if (missingConfig() || !auth || !db) throw new Error('Firebase is not configured');
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        const profileDoc = {
          displayName: name,
          email,
          mobile: String(mobile),
          role,
          createdAt: serverTimestamp(),
        };
        if (role === 'business' || role === 'shop') {
          profileDoc.shopName = (shopName || name || '').trim();
        }
        await setDoc(doc(db, 'users', cred.user.uid), profileDoc);
        if (role === 'business' || role === 'shop') {
          await setDoc(doc(db, 'shops', cred.user.uid), {
            userId: cred.user.uid,
            shopName: (shopName || name || '').trim(),
            description: '',
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        return cred.user;
      },
      async login(email, password) {
        if (missingConfig() || !auth) throw new Error('Firebase is not configured');
        await signInWithEmailAndPassword(auth, email, password);
      },
      async logout() {
        if (missingConfig() || !auth) return;
        await signOut(auth);
      },
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
