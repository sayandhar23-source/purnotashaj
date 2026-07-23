'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export type ProductSummary = {
  _id: string;
  title: string;
  slug: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  saleInfo?: {
    isActive: boolean;
    effectivePrice: number;
    originalPrice: number;
    discountPercent: number;
    endsAt: string | null;
  };
};

export default function ProductCard({ product }: { product: ProductSummary }) {
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const images = product.images?.length ? product.images : [];

  const startCycling = () => {
    if (images.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveImage((i) => (i + 1) % images.length);
    }, 800);
  };

  const stopCycling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveImage(0);
  };

  useEffect(() => () => stopCycling(), []); // cleanup on unmount

  const onSale = !!product.saleInfo?.isActive;
  const displayPrice = onSale ? product.saleInfo!.effectivePrice : product.basePrice;
  const strikePrice = onSale ? product.saleInfo!.originalPrice : product.compareAtPrice;
  const discount = onSale
    ? product.saleInfo!.discountPercent
    : product.compareAtPrice && product.compareAtPrice > product.basePrice
      ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)
      : null;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to save items to your wishlist.');
      return;
    }
    try {
      await api.post('/wishlist/toggle', { productId: product._id });
      toast.success('Wishlist updated');
    } catch {
      toast.error('Could not update wishlist.');
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          images.map((img, i) => (
            <Image
              key={img + i}
              src={img}
              alt={product.title}
              fill
              className={`object-cover transition-opacity duration-300 ${
                i === activeImage ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
        {discount && (
          <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-2 py-1 rounded-full ${onSale ? 'bg-red-500' : 'bg-brand-500'}`}>
            {onSale ? `SALE -${discount}%` : `-${discount}%`}
          </span>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === activeImage ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white"
          aria-label="Add to wishlist"
        >
          <Heart size={16} />
        </button>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{product.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold">₹{displayPrice}</span>
          {strikePrice && strikePrice > displayPrice && (
            <span className="text-gray-400 text-sm line-through">
              ₹{strikePrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
