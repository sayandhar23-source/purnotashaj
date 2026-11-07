'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from './api';
import { useAuth } from './auth-context';

type WishlistContextT = {
  wishlistIds: Set<string>;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextT>({
  wishlistIds: new Set(),
  isWishlisted: () => false,
  toggle: async () => {},
  loading: false,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    api
      .get('/wishlist')
      .then((res) => {
        const ids = (res.data.products || []).map((p: any) => p._id);
        setWishlistIds(new Set(ids));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  const toggle = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to save items to your wishlist.');
      return;
    }
    const wasWishlisted = wishlistIds.has(productId);

    // Optimistic update — feels instant, reverted on failure
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (wasWishlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      await api.post('/wishlist/toggle', { productId });
      toast.success(wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Could not update wishlist.');
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
