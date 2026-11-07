'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import ProductCard, { ProductSummary } from '@/components/ProductCard';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton';
import { useWishlist } from '@/lib/wishlist-context';

export default function WishlistPage() {
  useDocumentTitle('Wishlist');
  const { user, loading } = useAuth();
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }
    api
      .get('/wishlist')
      .then((res) => setProducts(res.data.products || []))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="skeleton h-7 rounded-md w-48 mb-8" />
        <ProductGridSkeleton className="grid grid-cols-2 md:grid-cols-4 gap-6" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-semibold mb-3">Log in to view your wishlist</h1>
        <Link href="/account/login" className="btn-primary inline-block mt-2">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-semibold mb-8">Your Wishlist</h1>
      {(() => {
        const visibleProducts = products.filter((p) => wishlistIds.has(p._id));
        return visibleProducts.length === 0 ? (
          <p className="text-gray-500 text-sm">No items saved yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {visibleProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        );
      })()}
    </div>
  );
}
