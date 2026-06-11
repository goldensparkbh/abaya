import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'abaya_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem(product, { size, color, quantity = 1 }) {
        setItems((prev) => {
          const key = `${product.id}-${size}-${color}`;
          const idx = prev.findIndex((i) => i.key === key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
            return next;
          }
          return [
            ...prev,
            {
              key,
              productId: product.id,
              shopId: product.shopId,
              shopName: product.shopName,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || '',
              size,
              color,
              quantity,
            },
          ];
        });
      },
      updateQuantity(key, quantity) {
        setItems((prev) =>
          prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i))
        );
      },
      removeItem(key) {
        setItems((prev) => prev.filter((i) => i.key !== key));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
