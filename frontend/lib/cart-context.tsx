'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  variantId?: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
};

// What the server reports when it can't accept the cart exactly as sent
export type CartProblem = {
  code: 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PRICE_INCREASED' | 'INVALID_VARIANT';
  product: string;
  variantId?: string;
  title: string;
  available?: number;
  newPrice?: number;
};

type CartContextT = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  applyServerChanges: (problems: CartProblem[]) => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextT>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  applyServerChanges: () => {},
  total: 0,
  count: 0,
});

const STORAGE_KEY = 'ecommerce_cart_v1';

// Pure, so it can be tested on its own
export function applyProblemsToItems(items: CartItem[], problems: CartProblem[]): CartItem[] {
  return items.flatMap((item) => {
    const p = problems.find(
      (x) => x.product === item.productId && (x.variantId || undefined) === (item.variantId || undefined),
    );
    if (!p) return [item];
    if (p.code === 'PRICE_INCREASED') return [{ ...item, price: p.newPrice ?? item.price }];
    if (p.code === 'INSUFFICIENT_STOCK') {
      return p.available && p.available > 0 ? [{ ...item, quantity: p.available }] : [];
    }
    return []; // UNAVAILABLE / OUT_OF_STOCK / INVALID_VARIANT
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId,
      );
      if (idx > -1) {
        const copy = [...prev];
        // New object rather than mutating the existing one — mutating state in
        // place can double-count quantities when React re-runs the updater.
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + item.quantity };
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId)),
    );
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i,
      ),
    );
  };

  const clearCart = () => setItems([]);

  // Brings the cart in line with what the server says is true: updated prices, reduced
  // quantities where stock is short, and removal of anything no longer available.
  const applyServerChanges = (problems: CartProblem[]) => setItems((prev) => applyProblemsToItems(prev, problems));

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, applyServerChanges, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
